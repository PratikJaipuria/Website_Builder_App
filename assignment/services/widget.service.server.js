module.exports = function (app) {

    app.get("/api/page/:pageId/widget", findWidgetsByPageId);
    app.get("/api/widget/:widgetId", findWidgetById);
    app.post("/api/page/:pageId/widget", createWidget);
    app.put("/api/widget/:widgetId", updateWidget);
    app.delete("/api/widget/:widgetId", deleteWidget);

    var widgets =[
        { "_id": "123", "widgetType": "HEADER", "pageId": "321", "size": "2", "text": "Welcome to FIFA 16"},
        { "_id": "234", "widgetType": "HEADER", "pageId": "321", "size": "4", "text": "Lorem ipsum"},
        { "_id": "345", "widgetType": "IMAGE", "pageId": "321", "width": "100%",
            "url": "http://lorempixel.com/400/200/sports/"},
        { "_id": "567", "widgetType": "HEADER", "pageId": "321", "size": "4", "text": "Lorem ipsum"},
        { "_id": "678", "widgetType": "YOUTUBE", "pageId": "321", "width": "100%",
            "url": "https://www.youtube.com/embed/AfeDwkIaHNY" }
    ];


    ///////////////
    var multer = require('multer'); // npm install multer --save

    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, __dirname + "/../../public/uploads")
        },
        filename: function (req, file, cb) {
            var extArray = file.mimetype.split("/");
            var extension = extArray[extArray.length - 1];
            cb(null, 'widget_image_' + Date.now() + '.' + extension)
        }
    });
    var upload = multer({storage: storage});

    app.post("/api/upload", upload.single('myFile'), uploadImage);

    function uploadImage(req, res) {
        var pageId = req.body.pageId;
        var widgetId_update = req.body.widgetId;
        var width = req.body.width;
        var userId = req.body.userId;
        var websiteId = req.body.websiteId;
        var myFile = req.file;
        var destination = myFile.destination; // folder where file is saved to
        if (widgetId_update) {
            var widgetId = widgetId_update;
        }else{

            var widgetId = ((new Date()).getTime()).toString();
            var newWidget = {
                _id: widgetId,
                widgetType: "IMAGE",
                pageId: pageId,
                width: width,
                url: ""
                // url:widget.url
            };
            widgets.push(newWidget);
        }

        for (var i in widgets) {

            if (widgets[i]._id == widgetId) {
                widgets[i].width = width;
                widgets[i].url = req.protocol + '://' + req.get('host') + "/uploads/" + myFile.filename;

            }
        }

        res.redirect("/assignment/#/user/" + userId + "/website/" + websiteId + "/page/" + pageId + "/widget/");
    }

    ///////////////

    function deleteWidget(req, res) {
        var widgetId = req.params.widgetId;
        for(var w in widgets) {
            var widgetToBedeleted = widgets[w];
            if (widgetToBedeleted._id === widgetId) {
                widgets.splice(w,1);
                res.json(widgetToBedeleted);
            }
        }
    }

    function updateWidget(req, res) {
        var widgetId = req.params.widgetId;
        var widget = req.body;
        widgets.find(function (widgetToBeUpdated) {
            if (widgetToBeUpdated._id === widgetId) {
                if(widgetToBeUpdated.widgetType === "HEADER") {
                    widgetToBeUpdated.size = widget.size;
                    widgetToBeUpdated.text = widget.text;
                } else if(widgetToBeUpdated.widgetType === "HTML") {
                    widgetToBeUpdated.text = widget.text;
                } else {
                    widgetToBeUpdated.width = widget.width;
                    widgetToBeUpdated.url = widget.url;
                }
                res.json(widgetToBeUpdated);
            }
        });
    }

    function createWidget(req, res) {
        var pageId = req.params.pageId;
        var widget = req.body;
        var newWidget;
        if(widget.widgetType === "HEADER") {
            newWidget = { "_id": (new Date()).getTime().toString(),
                "widgetType": widget.widgetType, "pageId": pageId, "size": widget.size, "text": widget.text};
        } else if (widget.widgetType === "HTML") {
            newWidget = { "_id": (new Date()).getTime().toString(),
                "widgetType": widget.widgetType, "pageId": pageId, "text": widget.text};
        } else {
            newWidget = { "_id": (new Date()).getTime().toString(),
                "widgetType": widget.widgetType, "pageId": pageId, "width": widget.width, "url": widget.url};
        }
        widgets.push(newWidget);
        res.json(newWidget);
    }

    function findWidgetById(req, res) {
        var widgetId = req.params.widgetId;
        widgets.find(function (widget) {
            if (widget._id === widgetId) {
                res.json(widget);
            }
        });
    }

    function findWidgetsByPageId(req, res) {
        var pageId = req.params.pageId;
        var widgetList = [];
        widgets.find(function (widget) {
            if (widget.pageId === pageId) {
                widgetList.push(widget);
            }
        });
        res.json(widgetList);
    }


};
