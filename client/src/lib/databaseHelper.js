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
}

export default new Database();
