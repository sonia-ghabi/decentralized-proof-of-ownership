const firebase = require("firebase");
let instance;

/**
 * Class that helps to do operations on the database.
 */
class Database {
  /**
   * Constructor.
   * This class is a singleton.
   */
  constructor() {
    if (instance) {
      return instance;
    }
    var config = {
      apiKey: process.env.apiKey,
      authDomain: process.env.authDomain,
      databaseURL: process.env.databaseURL,
      projectId: process.env.projectId,
      storageBucket: process.env.storageBucket,
      messagingSenderId: process.env.messagingSenderId
    };
    firebase.initializeApp(config);
    this.db = firebase.firestore();
    instance = this;
  }

  /**
   * Writes data to the database.
   * @param {string} collectionName
   * @param {object} object
   * @param {string} id
   */
  writeData(collectionName, object, id) {
    return this.db
      .collection(collectionName)
      .doc(id)
      .set(object);
  }

  /**
   * Reads data from the database.
   * @param {string} collectionName
   * @param {string} id
   */
  async readData(collectionName, id) {
    // Get the data by Id
    const req = await this.db
      .collection(collectionName)
      .doc(id)
      .get();
    // Return the object
    return req.data();
  }

  /**
   * Read all the documents from the given collection.
   * @param {string} collectionName
   */
  async readAll(collectionName) {
    // Query the database
    const res = await this.db.collection(collectionName).get();

    // Build the return object
    let data = [];
    res.forEach(function(doc) {
      // doc.data() is never undefined for query doc snapshots
      data.push({
        id: doc.id,
        owner: doc.data().owner,
        date: new Date(doc.data().date).toDateString(),
        name: doc.data().name
      });
    });

    // Return the data
    return data;
  }
}

module.exports = Database;
