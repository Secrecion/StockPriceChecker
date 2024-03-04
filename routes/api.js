"use strict";

const StockModel = require("../models").Stock;
const fetch = require("node-fetch");

async function getStock(stock) {
  const response = await fetch(
    `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`
  );
  const { symbol, latestPrice } = await response.json();
  return { symbol, latestPrice };
}

async function createStock(stock, like, ip) {
  console.log(like)
  const newStock = new StockModel({
    symbol: stock,
    likes: like ===true ? [ip] : [],
  });
  const savedNew = await newStock.save();
  return savedNew;
}

async function findStock(stock) {
  return await StockModel.findOne({ symbol: stock }).exec();
}

async function saveStock(stock, like, ip) {
  let saved = {};
  const foundStock = await findStock(stock);
  if (!foundStock) {
    const createsaved = await createStock(stock, like, ip);
    saved = createsaved;
    return saved;
  } else {
    if (like && foundStock.likes.indexOf(ip) === -1) {
    // if (like.toString()==="true"  && foundStock.likes.indexOf(ip) === -1) {
      foundStock.likes.push(ip);
    }
    saved = await foundStock.save();
    return saved;
  }
}

module.exports = function (app) {
  // https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/[symbol]/quote

  app.route("/api/stock-prices").get(async function (req, res) {
    const { stock, like } = req.query;

    if (Array.isArray(stock)) {
      console.log("stocks", stock);
      const { symbol, latestPrice } = await getStock(stock[0]);
      const { symbol: symbol2, latestPrice: latestPrice2 } = await getStock(
        stock[1]
      );
      if (!symbol || !symbol2) {
        res.json({
          stockData: [
            { error: "invalid symbol", rel_likes: 0 },
            { error: "invalid symbol", rel_likes: 0 },
          ],
        });
        return;
      }
      const oneStockData = await saveStock(symbol, like, req.ip);
      const twoStockData = await saveStock(symbol2, like, req.ip);
      console.log("One Stock Data", oneStockData);
      console.log("Two Stock Data", twoStockData);

      res.json({
        stockData: [{
          stock: symbol,
          price: latestPrice,
          rel_likes: oneStockData.likes.length-twoStockData.likes.length,
        },{
          stock: symbol2,
          price: latestPrice2,
          rel_likes: twoStockData.likes.length-oneStockData.likes.length, 
        }]
      });
      return;
    }

    const { symbol, latestPrice } = await getStock(stock);
    if (!symbol) {
      res.json({
        stockData: { error: "invalid symbol", likes: like ? 1 : 0 },
      });
      return;
    }
    const oneStockData = await saveStock(symbol, like, req.ip);
    console.log("One Stock Data", oneStockData);

    res.json({
      stockData: {
        stock: symbol,
        price: latestPrice,
        likes: oneStockData.likes.length,
      },
    });
  });
};
