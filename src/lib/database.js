const admin = require("firebase-admin");

/**
 * Class that helps to do operations on the database.
 */
class Database {
  /**
   * Constructor.
   */
  constructor() {
    const serviceAccount = require(process.env.privateKeyPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://proof-of-ownership-fe435.firebaseio.com"
    });
    this.db = admin.firestore();
  }

  /**
   * Verify the authentication token.
   * @param {string} idToken
   */
  async verifyToken(idToken) {
    const res = await admin.auth().verifyIdToken(idToken);
    return res.uid;
  }

  /**
   * Writes data to the database.
   * @param {string} collectionName
   * @param {object} object
   * @param {string} id
   */
  async writeData(collectionName, object, id) {
    return this.db
      .collection(collectionName)
      .doc(id)
      .set(object);
  }

  /**
   * Updates data in the database.
   * @param {string} collectionName
   * @param {object} object
   * @param {string} id
   */
  async updateData(collectionName, object, id) {
    let updateObject = {};
    Object.keys(object).forEach(key => {
      if (Array.isArray(object[key])) {
        updateObject[key] = admin.firestore.FieldValue.arrayUnion.apply(
          this,
          object[key]
        );
      } else updateObject[key] = object[key];
    });
    return this.db
      .collection(collectionName)
      .doc(id)
      .update(updateObject);
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

module.exports = new Database();
