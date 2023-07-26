const newman = require('newman');

const collections = [
    // Tested with ronaldaungkhantmin@gmail.com
    './test/scripts/pass_workflow.json',
    //Tested with testakm@gmail.com
    "./test/scripts/fail_workflow.json"
];

async function runCollections() {
  for (const collection of collections) {
    try {
      await new Promise((resolve, reject) => {
        newman.run({
          collection: collection,
          reporters: 'cli'
        }, function (err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
      console.log('Postman collection run complete!');
    } catch (err) {
      console.error(err);
    }
  }
}

runCollections();
