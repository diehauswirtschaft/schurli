const config = require("../config");

var MatomoTracker = require("matomo-tracker");

var matomo = new MatomoTracker(config.get("matomo:site"), config.get("matomo:url"));
matomo.on("error", function(err) {
    console.error(`Matomo error: ${err}`);
});

exports.trackVisit = function trackVisit(slug, fullURL, userAgent, referrer) {
    matomo.track({
        url: `${config.get("baseURL")}/s/${slug}`,
        action_name: "Unshorten",
        ua: userAgent,
        urlref: referrer,
        cvar: JSON.stringify({
            "1": ["fullURL", fullURL],
            "2": ["slug", slug]
        })
    });
};
