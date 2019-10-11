const { Firestore } = require("@google-cloud/firestore");
const firestore = new Firestore();

/**
 * Looks in the Firestore if the given slug has an associated URL.
 *
 * @param {string} slug a slug
 * @return {Promise<null|string>} the resolved full URL, or null if not found
 */
exports.getFullURL = async function getFullURL(slug) {
    const urlsRef = firestore.collection("urls");
    const querySnapshot = await urlsRef.where("slug", '==', slug).limit(1).get();

    if (querySnapshot.empty) {
        return null;
    } else {
        return querySnapshot.docs[0].get("url");
    }
};
