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
}

module.exports = Database;
