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

/**
 * Returns all URLs stored in the URL collection.
 *
 * @param {number} limit limit the number of URLs retrieved
 * @return {Array<{slug: string, url: string}>} the retrieved short URLs
 */
exports.listURLs = async function listURLs(limit = 500) {
    const urlsRef = firestore.collection("urls");
    const urlsSnapshot = await urlsRef.orderBy("slug").limit(limit).get();

    if (urlsSnapshot.empty) {
        return [];
    } else {
        return urlsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                slug: data.slug,
                url: data.url,
            };
        });
    }
};
