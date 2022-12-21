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
      let ids = body.ids;
      const timeOut = (id) => {
          return new Promise(async (resolve, reject) => {
              let params = {
                  TableName: tableName,
                  KeyConditionExpression: "slide_id = :slide_id and board_id = :board_id",
                  ExpressionAttributeValues: {
                      ":slide_id": id.slide_id,
                      ":board_id": id.board_id
                  }
              };
                client.query(params, async function (err, data) {
                if (err) {
                    console.log("error", JSON.stringify(err, null, 2))
                } else {
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
                }
              });
          })
      }

      ids.map((id) => {
          promises.push(timeOut(id))
      })

      await Promise.all(promises)
      console.time("PartiQL Query Duration")
      ddbClient.transactWrite(paramPuts, async function (err, data) {
          if (err) {
              console.log("error", JSON.stringify(err, null, 2))
          } else {
              console.log("success");
          }
      });
      console.timeEnd("PartiQL Query Duration")
      return JSON.stringify({"message": "ok"});
  }
}
