app.directive('navbar', function ($rootScope, AuthService, AUTH_EVENTS, $state) {

    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'js/common/directives/navbar/navbar.html',
        link: function (scope) {

            scope.items = [
                { label: 'Home', state: 'home' },
                { label: 'About', state: 'about' },
                { label: 'Tutorial', state: 'tutorial' },
                { label: 'Members Only', state: 'membersOnly', auth: true }
            ];

            scope.submitSearch = function(searchTerm) {
               // ClothingFactory.searchProducts(searchTerm).then(function(results) {
               //      var tmp = scope.searchTerm + '';
               //      scope.searchTerm = null;
               //      $state.go('clothing', { search: tmp});
               // }, function(err) {
               //      console.log(err);
               // });
            };

        }

    };

});

app.directive('prism', [function() {
   return {
       restrict: 'A',
       scope: {
           source: '@'
       },
       link: function(scope, element, attrs) {
           scope.$watch('source', function(v) {
               if(v) {
                   Prism.highlightElement(element.find("code")[0]);
               }
           });
       },
       template: "<code ng-bind='source'></code>"
   };
}]);