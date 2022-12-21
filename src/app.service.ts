import { Injectable } from '@nestjs/common';
const AmazonDaxClient = require('amazon-dax-client');
const AWS = require("aws-sdk");
@Injectable()
export class AppService {
  async getHello(body): Promise<string> {
    var region = "ap-northeast-1";
    AWS.config.update({
        region: region
    });
    var tableName = "slides";
    var ddbClient = new AWS.DynamoDB.DocumentClient()
    var daxClient = null;
    let endpoint = "daxs://digitaldax.bjtvoe.dax-clusters.ap-northeast-1.amazonaws.com"
    var dax = new AmazonDaxClient({ endpoints: [endpoint], region: region })
    daxClient = new AWS.DynamoDB.DocumentClient({ service: dax });
    var client = daxClient != null ? daxClient : ddbClient;
      const promises = [];
      var paramPuts = {
          TransactItems: []
      };
      var paramGets = {
          TransactItems: []
      };
      let ids = body.ids;
      const timeOut = (id, data) => {
          return new Promise(async (resolve, reject) => {
              // let params = {
              //     TableName: tableName,
              //     KeyConditionExpression: "slide_id = :slide_id and board_id = :board_id",
              //     ExpressionAttributeValues: {
              //         ":slide_id": id.slide_id,
              //         ":board_id": id.board_id
              //     }
              // };
              // const data = await client.query(params).promise();
              console.log(data)
              let item = data.Items[0];
              let idNews = body.idsNew;
              const ownerRole = body.ownerRole;
              const ownerId = body.ownerId;
              let obj = idNews.find(o => o.slide_id === item.slide_id);
              item.slide_id = obj.slide_id_new

              if (ownerRole == 4) {
                  paramPuts.TransactItems.push(
                      {
                          Put: {
                              Item: {
                                  ...item
                              },
                              TableName: tableName,
                          }
                      }
                  )
              } else {
                  Object.keys(item).forEach(function (key) {
                      if (key != "slide_id" && key != "board_id") {
                          item[key].ownerId = ownerId
                          item[key].ownerRole = ownerRole
                      }
                  });
                  paramPuts.TransactItems.push(
                      {
                          Put: {
                              Item: {
                                  ...item
                              },
                              TableName: tableName,
                          }
                      }
                  )
              }
              resolve(true)
          })
      }
      ids.forEach(async (id) => {
        await paramGets.TransactItems.push(
          {
            Get: {
              TableName: tableName,
              Key: {
                slide_id: id.slide_id,
                board_id: id.board_id
              }
            }
          }
        )
      })
      const data = await client.transactGet(paramGets).promise();
      ids.map((id) => {
          let data1 = data.Responses.find(o => o.Items.slide_id === id.slide_id)
          promises.push(timeOut(id, data1))
      })

      await Promise.all(promises)
      console.time("PartiQL Query Duration")
      ddbClient.transactWrite(paramPuts, async function (err, data) {
          if (err) {
              console.log("error", JSON.stringify(err, null, 2))
          } else {
              console.log("success");
              console.timeEnd("PartiQL Query Duration")
          }
      });
      return JSON.stringify({"message": "ok"});
  }
}
