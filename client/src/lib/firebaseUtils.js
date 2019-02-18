import firebase from "firebase";
let instance;

/**
 * Class that helps to do operations on the database.
 */
export default class Database {
  /**
   * Constructor.
   * This class is a singleton.
   */
  constructor() {
    if (instance) {
      return instance;
    }

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
    instance = this;
  }

  /**
   * Loads the album for the authenticated user..
   */
  async loadAlbum() {
    // Get the proofs the user is the owner of
    const res = await this.db
      .collection("proof")
      .where("owner", "==", firebase.auth().currentUser.uid)
      .get();

    // Build the return object
    let albumData = [];
    res.forEach(function(doc) {
      // doc.data() is never undefined for query doc snapshots
      albumData.push({
        id: doc.id,
        owner: doc.data().owner,
        date: new Date(doc.data().date).toDateString(),
        name: doc.data().name
      });
    });
    return albumData;
  }
}
