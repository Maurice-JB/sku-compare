const fs = require('fs');

/*
  ~~~ DUPLICATE CHECKING FUNCTIONS ~~~
*/
const count = items =>
  items.reduce((a, b) =>
    Object.assign(a, {[b]: (a[b] || 0) + 1}), {})
const duplicates = dict =>
  Object.keys(dict).filter((a) => dict[a] > 1)

/*
  ~~~ Read mongo txt list and filter out SKUs ~~~
*/
const mongoQuery = fs.readFileSync('mongo_query.txt', 'utf8')
const filteredMongoQuery = mongoQuery.match(/"(.*?[^\\])"/g).filter(x => x != '"Sku"');
console.log(filteredMongoQuery.length);

const mongoSkus = filteredMongoQuery
  .map(sku => {
    return sku.replace(/[""]+/g, '');
  })
  .join('\r\n');

fs.writeFileSync('mongo_filtered.txt', mongoSkus);

// const extractedskus = fs.readFileSync('mongo_filtered.txt', 'utf8');
const sqlSkus = fs.readFileSync('sql_query.txt', 'utf8');

const mongoArray = mongoSkus.split(/\r\n/g);
const sqlArray = sqlSkus.split(/\r\n/g);

// Remove Duplicates
const uniqMongo = [...new Set(mongoArray)];
const uniqSQL = [...new Set(sqlArray)];

console.log(`Length of mongo array: ${mongoArray.length}`);
console.log(`Length of SQL array: ${sqlArray.length}`);
console.log(`No. of Duplicates in mongo array: ${duplicates(count(mongoArray)).length}`);
console.log(`No. of Duplicates in sql array: ${duplicates(count(sqlArray)).length}`);

console.log(`Length of mongo array less duplicates: ${uniqMongo.length}`)
console.log(`Length of SQL array less duplicates: ${uniqSQL.length}`);

const affectedSkus = uniqSQL.filter(x => {
  return !uniqMongo.includes(x);
});

console.log('No. of Skus in SQL that are not in Mongo:')
console.log(affectedSkus.length);

const writeSkus = affectedSkus.join('\r\n');

fs.writeFile('affected_skus.txt', writeSkus, (err) => {
  if (err) throw err;
  console.log('Written to affected_skus.txt');
});
