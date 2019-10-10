const { Firestore } = require("@google-cloud/firestore");
const firestore = new Firestore();

exports.getFullURL = async function getFullURL(slug) {
    const urlsRef = firestore.collection("urls");
    const querySnapshot = await urlsRef.where("slug", '==', slug).limit(1).get();

    if (querySnapshot.empty) {
        return null;
    } else {
        return querySnapshot.docs[0].get("url");
    }
};
