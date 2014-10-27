(function() {

    var formatNumber = function(x) {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    };

    var Twitter = (function() {
        var followersCompiled = _.template($('#twitter-followers').html());
        var tweetCompiled = _.template($('#twitter-tweet').html());

        var displayFollowers = function (results) {
            var twitterData = results;
            var output = followersCompiled({followers: formatNumber(twitterData.followers_count)});
            $('.twitter.followers').html(output);
        };

        var limit = function(text, size) {
            if (text.length < size) {
                return text;
            } else {
                return text.substr(0, size)+'...';
            }
        };

        var displayLastTweets = function(results) {
            var lastTweets = _.first(results.statuses, 3);

            var output = '';
            _.each(lastTweets, function(tweet) {
                tweet.cleanText = limit(tweet.text, 100);
                tweet.date = new Date(tweet.created_at).toLocaleTimeString();
                output += tweetCompiled(tweet);
            });
            $('.twitter.tweets').fadeOut(function() { $(this).html(output).fadeIn(); });
        };

        return {
            'show': function() {
                $.getJSON('/api/twitter/infos')
                .done(displayFollowers)
                .fail(function() {
                    displayFollowers({ followers_count: 879}); // Fake
                });

                $.getJSON('/api/twitter/tweets').done(displayLastTweets);
            }
        };
    })();

    var Edito = (function() {
        var displayEdito = function(result) {
            $('.edito div').html(result.edito);
        };

        return {
            'show': function() {
                $.getJSON('/api/edito/infos').done(displayEdito);
            }
        };
    })();

    var Facebook = (function() {
        var facebookCompiled = _.template($('#facebook-fans').html());

        var displayFansCount = function(result) {
            var output = facebookCompiled({fan_count: formatNumber(result.fan_count)});
            $('.facebook.fans').html(output);
        };

        return {
            'show': function() {
                $.getJSON('/api/facebook/fans')
                .done(displayFansCount)
                .fail(function() {
                    displayFansCount({ fan_count: 80838}); // Fake
                });
            }
        };
    })();

    var CollecteIndoor = (function() {
        var map = new Mappy.api.map.Map({ container:'#indoorMap' });
        map.setCenter(new Mappy.api.geo.Coordinates(2.35099,48.85676),7);

        var parisLayer = new Mappy.api.map.layer.MarkerLayer(30);
        map.addLayer(parisLayer);

        var todayLayer = new Mappy.api.map.layer.MarkerLayer(31);
        map.addLayer(todayLayer);

        var showIndoor = function(markerLayer, image, conglomerated, results) {
            markerLayer.clean();
            _.each(results, function(point) {
                var icon = new Mappy.api.ui.Icon(Mappy.api.ui.Icon.DEFAULT);
                icon.image=image;
                var marker = new Mappy.api.map.Marker(new Mappy.api.geo.Coordinates(point.lng, point.lat), icon);
                markerLayer.addMarker(marker);
            });
            if(conglomerated === true) {
                markerLayer.conglomerate();
            }
        };

        return {
            'show': function() {
                $.getJSON('/api/indoor/paris').done(_.partial(showIndoor, parisLayer, '/img/markerB_small.png', true));
                $.getJSON('/api/indoor/paris/today').done(_.partial(showIndoor, todayLayer, '/img/markerV_small.png', false));
            }
        };
    })();

    var CollecteOutdoor = (function() {
        var map = new Mappy.api.map.Map({ container:'#outdoorMap' });
        map.setCenter(new Mappy.api.geo.Coordinates(2.1959,47.52),3);
        var markerLayer = new Mappy.api.map.layer.MarkerLayer(30);

        var showOutdoor = function(results) {
            markerLayer.clean();
            _.each(results, function(point) {
                var icon = new Mappy.api.ui.Icon(Mappy.api.ui.Icon.DEFAULT);
                icon.image = 'img/' + point.statut + '.png';
                icon.iconAnchor.x = 5;
                icon.iconAnchor.y = 5;
                var marker = new Mappy.api.map.Marker(new Mappy.api.geo.Coordinates(point.lng, point.lat), icon);
                markerLayer.addMarker(marker);
            });
            map.addLayer(markerLayer);
        };

        return {
            'show': function() {
                $.getJSON('/resources/outdoor.json').done(showOutdoor);
            }
        };
    })();

    var PoisInfo = (function() {
        var compiled = _.template($('#pois-count').html());

        var displayPois = function(jsonResponse) {
            if (jsonResponse.count !== null) {
                var output = compiled({ 
                    total: formatNumber(jsonResponse.total), 
                    ovm: formatNumber(jsonResponse.ovm), 
                    ovmRaw: jsonResponse.ovm,
                    vdr: formatNumber(jsonResponse.vdr), 
                    cviv: formatNumber(jsonResponse.cviv)
                });
                $('.pois .count').html(output);
            }
        };

        return {
            'show': function() {
                $.getJSON('/api/pois/count').done(displayPois);
            }
        };
    })();

    var AudienceInfo = (function() {
        var compiled = _.template($('#audience-count').html());

        var displayWebAudience = function(jsonResponse) {
            var output = compiled({ count: formatNumber(jsonResponse.count)});
            $('#audience .web').html(output);
        };
        var displayMobileAudience = function(jsonResponse) {
            var total = parseInt(jsonResponse.android, 10) + 
                parseInt(jsonResponse.iphone, 10) +
                parseInt(jsonResponse.bkml, 10) +
                parseInt(jsonResponse.fwb, 10);
            var output = compiled({ count: formatNumber(total)});
            $('#audience .mobile').html(output);
        };

        return {
            'show': function() {
                $.getJSON('/api/audience/web').done(displayWebAudience);
                $.getJSON('/api/audience/mobile').done(displayMobileAudience);
            }
        };
    })();

    var facebookPost = (function() {
        return {
            'refresh': function() {
                $('#feed iframe').get(0).contentWindow.location.reload(true);
            }
        };
    })();

    AudienceInfo.show();
    PoisInfo.show();
    Twitter.show();
    Facebook.show();
    CollecteIndoor.show();
    CollecteOutdoor.show();
    Edito.show();
    setInterval(AudienceInfo.show, 30 * 1000); // Refresh every 30 sec
    setInterval(PoisInfo.show, 60 * 1000); // Refresh every minute
    setInterval(Twitter.show, 120 * 1000); // Refresh every 2 minutes
    setInterval(Facebook.show, 120 * 1000); // Refresh every 2 minutes
    setInterval(CollecteIndoor.show, 12 * 60 * 60 * 1000); // Refresh twice a day
    setInterval(CollecteOutdoor.show, 12 * 60 * 60 * 1000); // Refresh twice a day
    setInterval(facebookPost.refresh, 60 * 60 * 1000); // Refresh hourly
    setInterval(Edito.show, 60 * 1000); // Refresh each minute

    $('#collecte .indoor').hide();
    var iMapAlternate = 0;
    setInterval(function alternateMaps() {
        if (iMapAlternate % 2 === 0) {
            $('#collecte .outdoor').fadeToggle(function() {
                $('#collecte .indoor').fadeToggle();
            });
        } else {
            $('#collecte .indoor').fadeToggle(function() {
                $('#collecte .outdoor').fadeToggle();
            });
        }
        iMapAlternate++;
    }, 30 * 1000);

    // Use new logo on maps
    $('.map .default-logo').attr('src','img/map-logo.png');
})();
