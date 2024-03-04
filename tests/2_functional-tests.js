const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {

    let anaLike=0;
  // Viewing one stock: GET request to /api/stock-prices/
  // Viewing one stock and liking it: GET request to /api/stock-prices/
  // Viewing the same stock and liking it again: GET request to /api/stock-prices/
  // Viewing two stocks: GET request to /api/stock-prices/
  // Viewing two stocks and liking them: GET request to /api/stock-prices/
  suite("5 functional get request tests", function () {
    test("Viewing one stock: GET request to /api/stock-prices/", function (done) {
      chai
        .request(server)
        .get("/api/stock-prices/")
        .set("content-type", "application/json")
        .query({ stock: "TSLA" })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData.stock, "TSLA");
          assert.exists(res.body.stockData.price, "TSLA has a price");
          done();
        });
    });

    test("Viewing one stock and liking it: GET request to /api/stock-prices/", function (done) {
      chai
        .request(server)
        .get("/api/stock-prices/")
        .set("content-type", "application/json")
        .query({ stock: "TSLA", like: true })
        .end(function (err, res) {
            anaLike=res.body.stockData.likes;
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData.stock, "TSLA");
          assert.exists(res.body.stockData.price, "TSLA has a price");
          assert.isAtLeast(res.body.stockData.likes, 1);
          done();
        });
    });

    test("Viewing the same stock and liking it again: GET request to /api/stock-prices/", function (done) {
      chai
        .request(server)
        .get("/api/stock-prices/")
        .set("content-type", "application/json")
        .query({ stock: "TSLA", like: true })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData.stock, "TSLA");
          assert.exists(res.body.stockData.price, "TSLA has a price");
          assert.equal(res.body.stockData.likes, anaLike);
          done();
        });
    });

    test("Viewing two stocks: GET request to /api/stock-prices/", function(done){
        chai.request(server)
        .get("/api/stock-prices/")
        .set("content-type", "application/json")
        .query({stock: ["TSLA", "AMZN"] })
        .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.body.stockData[0].stock, "TSLA");
            assert.equal(res.body.stockData[1].stock, "AMZN");
            assert.exists(res.body.stockData[0].price, "TSLA has a price");
            assert.exists(res.body.stockData[1].price, "AMZN has a price");
            done();
        });
    });

    test("Viewing two stocks and liking them: GET request to /api/stock-prices/", function(done){
        chai.request(server)
        .get("/api/stock-prices/")
        .set("content-type", "application/json")
        .query({stock: ["TSLA", "AMZN"], like:true })
        .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.body.stockData[0].stock, "TSLA");
            assert.equal(res.body.stockData[1].stock, "AMZN");
            assert.exists(res.body.stockData[0].price, "TSLA has a price");
            assert.exists(res.body.stockData[1].price, "AMZN has a price");
            assert.exists(res.body.stockData[0].rel_likes, "TSLA has a rel_likes");
            assert.exists(res.body.stockData[1].rel_likes, "AMZN has a rel_likes");
            done();
        });
    });
  });
});
