<img width="460" alt="die HausWirtschaft Logo" src="https://tools.diehauswirtschaft.at/public-static-files/logos/dhw-signet-logotype.png">

# schurli

A short URL service with Matomo for statistics. Rewrites short URLs
to their full version and tracks the unshortening via Matomo.

You can append a `?something` to send `something` as a query variable to the Matomo tracker.
This makes it possible to track the reach of campaigns, e.g. if you send out `/s/somePDF?foocampaign`, this will
associate the visit with `foocampaign`.

This project has been developed in the scope of [OPENhauswirtschaft][1]
for die HausWirtschaft.
OPENhauswirtschaft is powered by the Austrian ["Klima- und Energiefonds"][2]'s
*[Smart Cities Demo - Living Urban Innovation][3]* program.

<img width="200" alt="" src="https://tools.diehauswirtschaft.at/public-static-files/logos/klien-poweredby.jpg">

## License

Apache 2.0

[1]: https://www.smartcities.at/stadt-projekte/smart-cities/#innovatives-hauswirtschaften-im-nutzungsgemischten-stadtkern
[2]: https://www.klimafonds.gv.at/
[3]: https://www.smartcities.at/
