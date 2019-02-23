import firebase from "firebase";

/**
 * Class that helps to do operations on the database.
 */
class Database {
  /**
   * Constructor.
   */
  constructor() {
    const config = {
      apiKey: "AIzaSyBDr1SeIrqIEQHSpLj5ZchSsBXKv-cJApA",
      authDomain: "proof-of-ownership-fe435.firebaseapp.com",
      databaseURL: "https://proof-of-ownership-fe435.firebaseio.com",
      projectId: "proof-of-ownership-fe435",
      storageBucket: "proof-of-ownership-fe435.appspot.com",
      messagingSenderId: "1066102571477"
    };
    firebase.initializeApp(config);
    this.db = firebase.firestore();
  }

  /**
   * Reads data from the database according to the filter.
   * @param {string} collectionName
   * @param {string} fieldName
   * @param {string} op
   * @param {string} value
   */
  async readWithFilter(collectionName, fieldName, op, value) {
    // Query the database
    const res = await this.db
      .collection(collectionName)
      .where(fieldName, op, value)
      .get();
    return res.docs.reduce((acc, doc) => {
      acc[doc.id] = doc.data();
      return acc;
    }, {});
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

export default new Database();
