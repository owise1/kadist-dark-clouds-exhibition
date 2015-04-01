var _pl = {
  db : 'liblib',
  design : 'liblib-exhib'
};
 
window.URL = window.URL || window.webkitURL;

var LibLibExhibApp = angular.module('LibLibExhibApp', ['CornerCouch', 'ngSanitize'])
  .config( [
      '$compileProvider',
      function( $compileProvider ){   
          var okReg = /^\s*(https?|blob):/;
          $compileProvider.aHrefSanitizationWhitelist(okReg);
          $compileProvider.imgSrcSanitizationWhitelist(okReg);
      }
  ]);

LibLibExhibApp.controller('ListingCtrl', ['$scope', '$http', 'cornercouch', function ($scope, $http, cornercouch) {
  var config = window._pl
  $scope.db = cornercouch().getDB(config.db)
  $scope.touch = Modernizr.touch
  $scope.currentVid = false
  $scope.setCurrent = function (media) {
    $scope.currentVid = media 
  }

  // exhibition information
  var exhibitionID = 'liblib-exhib-exhibition'; // figure out a way to have more than one of these
  function fetchExhibitionDoc(){
    $scope.db.newDoc().load(exhibitionID)
    .success(function(doc){
      $scope.exhibitionDoc = processDoc(doc);
    })
    .error(function(err){
      $scope.db.newDoc({ _id : exhibitionID }).save()
      .success(fetchExhibitionDoc)
      .error(function(res){
        console.log('error 2');
        console.log(res);
      });
    })

  }

  $scope.upload = function(elem){
    var files = [];
    for (var i = 0, f; f = elem.files[i]; i++) {
      files.push(f);
    }
    files.forEach(function(f){
      var doc = $scope.db.newDoc({
        name : f.name,
        content_type : f.type
      })
      doc.save()
      .success(function(){
        doc.attach(f, f.name, getListing); 
      });
    })
  }

  $scope.del = function(doc){
    $scope.db.newDoc(doc).remove().success(getListing);
  }

  $scope.save = function(doc){
    var file = doc.file;
    if(file){
      delete doc.file;
      var d = $scope.db.newDoc(doc);
      d.save()
      .success(function(){
        d.attach(file, 'cover' + '.' + file.name.split('.').pop(), getListing);
      });

    } else {
      $scope.db.newDoc(doc).save().success(getListing);
    }
  }

  // get listing
  function getListing(){
    $scope.db.query(config.design, 'media', { reduce : false, limit : 10, include_docs : true })
    .success(function(resp){
      $scope.medias = resp.rows.map(R.prop('doc')).map(processDoc);
      fetchExhibitionDoc();
    });
  }
  getListing();

  function processDoc(doc){
    if(doc._attachments){
      angular.forEach(doc._attachments, function(attachInfo, attachName){
        if(/^cover\./.test(attachName)){
            doc.coverImg = '/' + config.db + '/' + doc._id + '/' + attachName;
        } else {
          doc.media     = attachInfo;
          doc.media.url = '/' + config.db + '/' + doc._id + '/' + attachName;
        }
      });
    }
    return doc; 
  }
  


  // $http.get($scope.DB + '_design/peoples-lib/_view/media?reduce=false&limit=10&include_docs=true')
}])
.directive("fileread", [function () {
    return {
        scope: {
            fileread: "="
        },
        link: function (scope, element, attributes) {
            element.bind("change", function (changeEvent) {
                scope.$apply(function () {
                    scope.fileread = changeEvent.target.files[0];
                    // or all selected files:
                    // scope.fileread = changeEvent.target.files;
                });
            });
        }
    }
}])
.filter('sanitize', ['$sce', function($sce){
  return function(html){
    return $sce.trustAsHtml(html);
  }
}]);;

