var app = angular.module('CodeReviewExt', ['ui.router', 'ui.bootstrap', 'ngMaterial']);


app.config(function ($mdIconProvider, $urlRouterProvider, $locationProvider, $compileProvider) {
    // This turns off hashbang urls (/#about) and changes it to something normal (/about)
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
    // If we go to a URL that ui-router doesn't have registered, go to the "/" url.
    $urlRouterProvider.otherwise('/');

    $mdIconProvider
    .iconSet("call", 'img/icons/communication-icons.svg', 24)
    .iconSet("social", 'img/icons/social-icons.svg', 24);


    // whitelist the chrome-extension: protocol
    // so that it does not add "unsafe:"
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|local|chrome-extension):|data:image\//);

});



app.factory('popupGitFactory', function($http) {
    var domain = "http://localhost:1337";

    return {

        getUserInfo: function() {
          return $http.get(domain + "/session").then(function(res){
            return res.data.user; 
          });
        },

        getReposToAdd: function(token) {
          console.log('hit getrepo', token)
          return $http.get(domain + "/api/git", {params: token})
          .then(function(res) {
            return res.data;
          })
        },

        getContributors: function(contributorUrl) {
          var i = contributorUrl.match(/repos/).index + 6;
          var repoUrl = contributorUrl.slice(i, -13);
          var owner = repoUrl.split('/')[0];
          var repo = repoUrl.split('/')[1];

          return $http.get(domain + "/api/git/repos/" + owner + '/' + repo + '/contributors')
          .then(function(res) {
            return res.data;
          })
        },

        //deleting repo from profile
        editRepo: function(user) {
          console.log('addRepoToProfile factory',user.repos)
          var repo = {repo: user.repos}
          return $http.put(domain + "/api/users/" + user.github.username + "/editRepo", repo)
          .then(function(res) {
            return res.data;
          })
        },

        archiveRepo: function(user) {
          console.log('archieve repo factory', user.archives);
          var archives = {repo: user.archives}
          return $http.put(domain + '/api/users/' + user.github.username + '/archiveRepo', archives)
          .then(function(res) {
            return res.data;
          })
        },

        listFiles: function(repo) {
          console.log('list file names under the repo', repo)
          return $http.get(domain + "/api/repo/all", {params: repo})
          .then(function(res) {
            return res.data;
          })
        },

        repoFindOrInsert: function(repo) {
          console.log('is there such repo? factory', repo)
          return $http.get(domain + "/api/repo/", {params: repo})
          .then(function(res){
            return res.data;
          })
        },

        logout: function() {
          console.log('hitting the factory')
          return $http.get(domain +'/logout').then(function (res) {
      			 return "Logged Out";
    		});
      }
    }
});


// 'use strict';
// app.directive('sidebar', function ($rootScope, $state, popupGitFactory, $timeout, $mdSidenav, $log) {
//
//     return {
//         restrict: 'E',
//         scope: {},
//         templateUrl: 'js/common/directives/sidebar/sidebar.html',
//         link: function (scope) {
//
//           scope.close = function () {
//           $mdSidenav('right').close()
//             .then(function () {
//               $log.debug("close LEFT is done");
//             });
//           };
//
//         }
//     }
//
//   }
// });

'use strict';
app.config(function ($stateProvider) {
	$stateProvider.state('archive', {
		url: '/archive',
		templateUrl: 'js/application/states/archive/archive.html',
		controller: 'ArchiveCtrl',
		resolve: {
			Authenticate: function($http, $state) {
				$http.get("http://localhost:1337/session").then(function(res) {
					if (res.data) {
						return
					}
					else {
						$state.go('login')
					}
				});
			}
		}
	});
});

//add Factory
app.controller('ArchiveCtrl', function ($scope, $state, popupGitFactory, $mdDialog) {

  popupGitFactory.getUserInfo().then(function(user) {
		$scope.user = user.user;
    $scope.showArch = $scope.user.archives;
	})



})

'use strict';
// app.config(function ($stateProvider) {
// 	$stateProvider.state('file', {
// 		url: '/file',
// 		templateUrl: 'js/application/states/files/file.html',
// 		controller: 'FileCtrl',
// 		resolve: {
// 			Authenticate: function($http, $state) {
// 				$http.get("http://localhost:1337/session").then(function(res) {
// 					if (res.data) {
// 						return
// 					}
// 					else {
// 						$state.go('login')
// 					}
// 				});
// 			}
// 		}
// 	});
// });

//add Factory
app.controller('FileCtrl', function ($scope, $state, popupGitFactory, $modalInstance, repo, $mdDialog) {

  popupGitFactory.getUserInfo().then(function(user) {
		$scope.user = user.user;
		$scope.displayName = $scope.user.github.name;

	})

	$scope.repoName = repo.name;
	console.log('from the controller is the repo', repo)

	popupGitFactory.listFiles(repo).then(function(repo){

		console.log('list files', repo)

		repo.files.forEach(function(file) {
			var url = file.fileUrl;
			var i = url.match(/blob/).index + 5;
			file.display = url.slice(i);
		})
		$scope.filesUnderRepo = repo.files;
	})


	// $scope.showYourFiles = $scope.user.repos;

	$scope.goToFile = function(file) {
		chrome.tabs.create({
        url: file.fileUrl
    });
	}

	$scope.close = function () {
    $modalInstance.close();
  }


})



// https://github.com/nyjy85/code_review/commit/4e0f7ec33539804316dfff786b80be86de672ea4
// https://github.com/nyjy85/code_review/blob/rightClick/browser/scss/home/main.scss

// Branch: rightClick
// Repo Name: code_review
// Files: /browser/scss/home/main.scss

'use strict';
app.config(function ($stateProvider) {
	$stateProvider.state('home', {
		url: '/home',
		templateUrl: 'js/application/states/home/home.html',
		controller: 'HomeCtrl',
		resolve: {
			Authenticate: function($http, $state) {
				$http.get("http://localhost:1337/session").then(function(res) {
					if (res.data) {
						return
					}
					else {
						$state.go('login')
					}
				});
			}
		}
	});
});

app.controller('HomeCtrl', function ($scope, $state, popupGitFactory, $timeout, $mdSidenav, $mdUtil, $log, $modal, $mdDialog) {

  popupGitFactory.getUserInfo().then(function(user) {
		$scope.user = user;
		$scope.tokenObj = {token: $scope.user.github.token};
		$scope.showRepos = $scope.user.repos;
		$scope.loadRepos();
	})

	$scope.loadRepos = function () {
		popupGitFactory.getReposToAdd($scope.tokenObj)
		.then(function(repos) {
				$scope.reposToAdd = repos;
		}).catch($log.log.bind($log));
	}


	$scope.toggleAddBar = function () {
		$scope.showAddBar = !$scope.showAddBar;
	}


	var cannotAddBox = function () {
		$mdDialog.show(
		$mdDialog.alert()
			.parent(angular.element(document.body))
			.title('Unfortunately')
			.content('You cannot add a repo you already added.')
			.ok('Got it!')
		);
	}

	$scope.addRepo = function (repo) {

			popupGitFactory.getContributors(repo.contributors_url)
			.then(function(names) {
				repo.contributors = names;

				var saverepo = {name: repo.name, url: repo.html_url, contributors: repo.contributors}

				//create Repo if it doesn't exist in the Repo.db + add repo to User.db
				popupGitFactory.repoFindOrInsert(saverepo).then(function(resData) {
					if(!resData.userAlreadyHad) {
						$scope.user.repos.push(resData.repo);
						chromeRefresh();
					}
					else cannotAddBox();

				})
			})
	}

	$scope.deleteRepo = function(repo) {
		console.log('deleting repo')

		var confirm = $mdDialog.confirm()
      .parent(angular.element(document.body))
      .title('Confirm')
      .content('Would you like to delete this repo?')
      .ok('Yes!')
      .cancel('No!');

		$mdDialog.show(confirm).then(function() {
			//after confirm delete
			console.log('users repo', $scope.user.repos)
			$scope.user.repos.forEach(function(userrepo, i) {
				console.log('userrepo in deleterepo!!!', userrepo, repo)
				if (userrepo._id === repo._id) $scope.user.repos.splice(i,1);
			})
			popupGitFactory.editRepo($scope.user).then(function(res) {
				chromeRefresh();
			})

    });

	}

	$scope.goArchive = function() {
		$state.go('archive');
	}

	$scope.archiveRepo = function(repo) {
		var confirm = $mdDialog.confirm()
      .parent(angular.element(document.body))
      .title('Confirm')
      .content('Would you like to archive this repo?')
      .ok('Yes!')
      .cancel('No!');

		$mdDialog.show(confirm).then(function() {
			//after confirm to archive
			//add repo to user.archives
			$scope.user.archives.push(repo);
			console.log($scope.user.archives);
			popupGitFactory.archiveRepo($scope.user).then(function(res) {
				console.log('archived to db', res)
			})

			//delete repo from user.repos
			$scope.user.repos.forEach(function(userrepo, i) {
				if (userrepo._id === repo._id) $scope.user.repos.splice(i,1);
			})
			popupGitFactory.editRepo($scope.user).then(function(res) {
				console.log('deleted repo', res)
			})

    });

	}

	$scope.goToRepo = function(repo) {
		chrome.tabs.create({
        url: repo.url
    });
	}

	//list files under a repo
	$scope.listFiles = function(repo) {
		var modalInstance = $modal.open({
      templateUrl: 'js/application/states/files/file.html',
      controller: 'FileCtrl',
      resolve: {
        repo: function() {
          return repo;
        }
      }
    });
	}

	//log out
	$scope.logout = function () {
		popupGitFactory.logout().then(function(res){
			$state.go('login');
			// chrome.tabs.query({title: 'Highlight Your World'}, function(tabs){
   //        		tabs.forEach(function(tab){
   //          	chrome.tabs.sendMessage(tab.id, message: 'logout');
   //          	})
   //        	});
		})
	}

	//sidebar
	$scope.toggleLeft = buildToggler('left');

	function buildToggler(navID) {
      var debounceFn =  $mdUtil.debounce(function(){
            $mdSidenav(navID)
              .toggle()
              .then(function () {
                $log.debug("toggle " + navID + " is done");
              });
          },300);
      return debounceFn;
  }

	$scope.close = function () {
      $mdSidenav('left').close()
        .then(function () {
          $log.debug("close LEFT is done");
        });
  	};

  	function chromeRefresh () {
  		chrome.tabs.query({title: 'Highlight Your World'}, function(tabs){
		tabs.forEach(function(tab){
			chrome.tabs.reload(tab.id);
			})
		})
  	};

})

app.config(function ($stateProvider) {
	$stateProvider.state('login', {
		url: '/',
		templateUrl: 'js/application/states/login/login.html',
		controller: 'LoginController',
		resolve: {
			Login: function($http, $state) {
				$http.get("http://localhost:1337/session").then(function(res) {
					if(res.data) {
						$state.go('home')
					}
					else {
						return
					}
				});
			}
		}
	});
});

app.controller('LoginController', function($scope, $state, popupGitFactory){
  $scope.message = "Check this page out now!";

	// $scope.loggedin = false;

	$scope.gitLogin = function() {
		//need to change localhost:1337 to the appropriate domain name after deployment!!!
		console.log('gitLogin')
		$scope.SuccessfulLogin();
		chrome.tabs.create({
        url: "http://localhost:1337/auth/github"
    });

	}


	// console.log(session)


	$scope.SuccessfulLogin = function() {
		console.log('successuflly loggin')

		$state.go('home')
		getName();
		// $scope.loggedin = true;
	}

	var getName = function() {
		popupGitFactory.getUserInfo().then(function(data) {
			console.log('getName', data);
			// $scope.name =
		})
	}
})

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImZhY3Rvcmllcy9wb3B1cEdpdEZhY3RvcnkuanMiLCJkaXJlY3RpdmVzL3NldHRpbmdCdXR0b24vc2V0dGluZ0J1dHRvbi5qcyIsImRpcmVjdGl2ZXMvc2lkZWJhci9zaWRlYmFyLmpzIiwic3RhdGVzL2FyY2hpdmUvYXJjaGl2ZS5qcyIsInN0YXRlcy9maWxlcy9maWxlLmpzIiwic3RhdGVzL2hvbWUvaG9tZS5qcyIsInN0YXRlcy9sb2dpbi9sb2dpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFFQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdDb2RlUmV2aWV3RXh0JywgWyd1aS5yb3V0ZXInLCAndWkuYm9vdHN0cmFwJywgJ25nTWF0ZXJpYWwnXSk7XG5cblxuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJG1kSWNvblByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIsICRsb2NhdGlvblByb3ZpZGVyLCAkY29tcGlsZVByb3ZpZGVyKSB7XG4gICAgLy8gVGhpcyB0dXJucyBvZmYgaGFzaGJhbmcgdXJscyAoLyNhYm91dCkgYW5kIGNoYW5nZXMgaXQgdG8gc29tZXRoaW5nIG5vcm1hbCAoL2Fib3V0KVxuICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh7XG4gICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgIHJlcXVpcmVCYXNlOiBmYWxzZVxuICAgIH0pO1xuICAgIC8vIElmIHdlIGdvIHRvIGEgVVJMIHRoYXQgdWktcm91dGVyIGRvZXNuJ3QgaGF2ZSByZWdpc3RlcmVkLCBnbyB0byB0aGUgXCIvXCIgdXJsLlxuICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcblxuICAgICRtZEljb25Qcm92aWRlclxuICAgIC5pY29uU2V0KFwiY2FsbFwiLCAnaW1nL2ljb25zL2NvbW11bmljYXRpb24taWNvbnMuc3ZnJywgMjQpXG4gICAgLmljb25TZXQoXCJzb2NpYWxcIiwgJ2ltZy9pY29ucy9zb2NpYWwtaWNvbnMuc3ZnJywgMjQpO1xuXG5cbiAgICAvLyB3aGl0ZWxpc3QgdGhlIGNocm9tZS1leHRlbnNpb246IHByb3RvY29sXG4gICAgLy8gc28gdGhhdCBpdCBkb2VzIG5vdCBhZGQgXCJ1bnNhZmU6XCJcbiAgICAkY29tcGlsZVByb3ZpZGVyLmFIcmVmU2FuaXRpemF0aW9uV2hpdGVsaXN0KC9eXFxzKihodHRwcz98ZnRwfG1haWx0b3xjaHJvbWUtZXh0ZW5zaW9uKTovKTtcbiAgICAkY29tcGlsZVByb3ZpZGVyLmltZ1NyY1Nhbml0aXphdGlvbldoaXRlbGlzdCgvXlxccyooaHR0cHM/fGZ0cHxmaWxlfGxvY2FsfGNocm9tZS1leHRlbnNpb24pOnxkYXRhOmltYWdlXFwvLyk7XG5cbn0pO1xuXG5cbiIsImFwcC5mYWN0b3J5KCdwb3B1cEdpdEZhY3RvcnknLCBmdW5jdGlvbigkaHR0cCkge1xuICAgIHZhciBkb21haW4gPSBcImh0dHA6Ly9sb2NhbGhvc3Q6MTMzN1wiO1xuXG4gICAgcmV0dXJuIHtcblxuICAgICAgICBnZXRVc2VySW5mbzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuICRodHRwLmdldChkb21haW4gKyBcIi9zZXNzaW9uXCIpLnRoZW4oZnVuY3Rpb24ocmVzKXtcbiAgICAgICAgICAgIHJldHVybiByZXMuZGF0YS51c2VyOyBcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRSZXBvc1RvQWRkOiBmdW5jdGlvbih0b2tlbikge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdoaXQgZ2V0cmVwbycsIHRva2VuKVxuICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoZG9tYWluICsgXCIvYXBpL2dpdFwiLCB7cGFyYW1zOiB0b2tlbn0pXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzLmRhdGE7XG4gICAgICAgICAgfSlcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRDb250cmlidXRvcnM6IGZ1bmN0aW9uKGNvbnRyaWJ1dG9yVXJsKSB7XG4gICAgICAgICAgdmFyIGkgPSBjb250cmlidXRvclVybC5tYXRjaCgvcmVwb3MvKS5pbmRleCArIDY7XG4gICAgICAgICAgdmFyIHJlcG9VcmwgPSBjb250cmlidXRvclVybC5zbGljZShpLCAtMTMpO1xuICAgICAgICAgIHZhciBvd25lciA9IHJlcG9Vcmwuc3BsaXQoJy8nKVswXTtcbiAgICAgICAgICB2YXIgcmVwbyA9IHJlcG9Vcmwuc3BsaXQoJy8nKVsxXTtcblxuICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoZG9tYWluICsgXCIvYXBpL2dpdC9yZXBvcy9cIiArIG93bmVyICsgJy8nICsgcmVwbyArICcvY29udHJpYnV0b3JzJylcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICB9KVxuICAgICAgICB9LFxuXG4gICAgICAgIC8vZGVsZXRpbmcgcmVwbyBmcm9tIHByb2ZpbGVcbiAgICAgICAgZWRpdFJlcG86IGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnYWRkUmVwb1RvUHJvZmlsZSBmYWN0b3J5Jyx1c2VyLnJlcG9zKVxuICAgICAgICAgIHZhciByZXBvID0ge3JlcG86IHVzZXIucmVwb3N9XG4gICAgICAgICAgcmV0dXJuICRodHRwLnB1dChkb21haW4gKyBcIi9hcGkvdXNlcnMvXCIgKyB1c2VyLmdpdGh1Yi51c2VybmFtZSArIFwiL2VkaXRSZXBvXCIsIHJlcG8pXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzLmRhdGE7XG4gICAgICAgICAgfSlcbiAgICAgICAgfSxcblxuICAgICAgICBhcmNoaXZlUmVwbzogZnVuY3Rpb24odXNlcikge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdhcmNoaWV2ZSByZXBvIGZhY3RvcnknLCB1c2VyLmFyY2hpdmVzKTtcbiAgICAgICAgICB2YXIgYXJjaGl2ZXMgPSB7cmVwbzogdXNlci5hcmNoaXZlc31cbiAgICAgICAgICByZXR1cm4gJGh0dHAucHV0KGRvbWFpbiArICcvYXBpL3VzZXJzLycgKyB1c2VyLmdpdGh1Yi51c2VybmFtZSArICcvYXJjaGl2ZVJlcG8nLCBhcmNoaXZlcylcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICB9KVxuICAgICAgICB9LFxuXG4gICAgICAgIGxpc3RGaWxlczogZnVuY3Rpb24ocmVwbykge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdsaXN0IGZpbGUgbmFtZXMgdW5kZXIgdGhlIHJlcG8nLCByZXBvKVxuICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoZG9tYWluICsgXCIvYXBpL3JlcG8vYWxsXCIsIHtwYXJhbXM6IHJlcG99KVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICAgIH0pXG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVwb0ZpbmRPckluc2VydDogZnVuY3Rpb24ocmVwbykge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdpcyB0aGVyZSBzdWNoIHJlcG8/IGZhY3RvcnknLCByZXBvKVxuICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoZG9tYWluICsgXCIvYXBpL3JlcG8vXCIsIHtwYXJhbXM6IHJlcG99KVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcyl7XG4gICAgICAgICAgICByZXR1cm4gcmVzLmRhdGE7XG4gICAgICAgICAgfSlcbiAgICAgICAgfSxcblxuICAgICAgICBsb2dvdXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdoaXR0aW5nIHRoZSBmYWN0b3J5JylcbiAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KGRvbWFpbiArJy9sb2dvdXQnKS50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgIFx0XHRcdCByZXR1cm4gXCJMb2dnZWQgT3V0XCI7XG4gICAgXHRcdH0pO1xuICAgICAgfVxuICAgIH1cbn0pO1xuIiwiIiwiLy8gJ3VzZSBzdHJpY3QnO1xuLy8gYXBwLmRpcmVjdGl2ZSgnc2lkZWJhcicsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkc3RhdGUsIHBvcHVwR2l0RmFjdG9yeSwgJHRpbWVvdXQsICRtZFNpZGVuYXYsICRsb2cpIHtcbi8vXG4vLyAgICAgcmV0dXJuIHtcbi8vICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbi8vICAgICAgICAgc2NvcGU6IHt9LFxuLy8gICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2NvbW1vbi9kaXJlY3RpdmVzL3NpZGViYXIvc2lkZWJhci5odG1sJyxcbi8vICAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlKSB7XG4vL1xuLy8gICAgICAgICAgIHNjb3BlLmNsb3NlID0gZnVuY3Rpb24gKCkge1xuLy8gICAgICAgICAgICRtZFNpZGVuYXYoJ3JpZ2h0JykuY2xvc2UoKVxuLy8gICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuLy8gICAgICAgICAgICAgICAkbG9nLmRlYnVnKFwiY2xvc2UgTEVGVCBpcyBkb25lXCIpO1xuLy8gICAgICAgICAgICAgfSk7XG4vLyAgICAgICAgICAgfTtcbi8vXG4vLyAgICAgICAgIH1cbi8vICAgICB9XG4vL1xuLy8gICB9XG4vLyB9KTtcbiIsIid1c2Ugc3RyaWN0JztcbmFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cdCRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdhcmNoaXZlJywge1xuXHRcdHVybDogJy9hcmNoaXZlJyxcblx0XHR0ZW1wbGF0ZVVybDogJ2pzL2FwcGxpY2F0aW9uL3N0YXRlcy9hcmNoaXZlL2FyY2hpdmUuaHRtbCcsXG5cdFx0Y29udHJvbGxlcjogJ0FyY2hpdmVDdHJsJyxcblx0XHRyZXNvbHZlOiB7XG5cdFx0XHRBdXRoZW50aWNhdGU6IGZ1bmN0aW9uKCRodHRwLCAkc3RhdGUpIHtcblx0XHRcdFx0JGh0dHAuZ2V0KFwiaHR0cDovL2xvY2FsaG9zdDoxMzM3L3Nlc3Npb25cIikudGhlbihmdW5jdGlvbihyZXMpIHtcblx0XHRcdFx0XHRpZiAocmVzLmRhdGEpIHtcblx0XHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRcdCRzdGF0ZS5nbygnbG9naW4nKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcbn0pO1xuXG4vL2FkZCBGYWN0b3J5XG5hcHAuY29udHJvbGxlcignQXJjaGl2ZUN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCAkc3RhdGUsIHBvcHVwR2l0RmFjdG9yeSwgJG1kRGlhbG9nKSB7XG5cbiAgcG9wdXBHaXRGYWN0b3J5LmdldFVzZXJJbmZvKCkudGhlbihmdW5jdGlvbih1c2VyKSB7XG5cdFx0JHNjb3BlLnVzZXIgPSB1c2VyLnVzZXI7XG4gICAgJHNjb3BlLnNob3dBcmNoID0gJHNjb3BlLnVzZXIuYXJjaGl2ZXM7XG5cdH0pXG5cblxuXG59KVxuIiwiJ3VzZSBzdHJpY3QnO1xuLy8gYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbi8vIFx0JHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2ZpbGUnLCB7XG4vLyBcdFx0dXJsOiAnL2ZpbGUnLFxuLy8gXHRcdHRlbXBsYXRlVXJsOiAnanMvYXBwbGljYXRpb24vc3RhdGVzL2ZpbGVzL2ZpbGUuaHRtbCcsXG4vLyBcdFx0Y29udHJvbGxlcjogJ0ZpbGVDdHJsJyxcbi8vIFx0XHRyZXNvbHZlOiB7XG4vLyBcdFx0XHRBdXRoZW50aWNhdGU6IGZ1bmN0aW9uKCRodHRwLCAkc3RhdGUpIHtcbi8vIFx0XHRcdFx0JGh0dHAuZ2V0KFwiaHR0cDovL2xvY2FsaG9zdDoxMzM3L3Nlc3Npb25cIikudGhlbihmdW5jdGlvbihyZXMpIHtcbi8vIFx0XHRcdFx0XHRpZiAocmVzLmRhdGEpIHtcbi8vIFx0XHRcdFx0XHRcdHJldHVyblxuLy8gXHRcdFx0XHRcdH1cbi8vIFx0XHRcdFx0XHRlbHNlIHtcbi8vIFx0XHRcdFx0XHRcdCRzdGF0ZS5nbygnbG9naW4nKVxuLy8gXHRcdFx0XHRcdH1cbi8vIFx0XHRcdFx0fSk7XG4vLyBcdFx0XHR9XG4vLyBcdFx0fVxuLy8gXHR9KTtcbi8vIH0pO1xuXG4vL2FkZCBGYWN0b3J5XG5hcHAuY29udHJvbGxlcignRmlsZUN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCAkc3RhdGUsIHBvcHVwR2l0RmFjdG9yeSwgJG1vZGFsSW5zdGFuY2UsIHJlcG8sICRtZERpYWxvZykge1xuXG4gIHBvcHVwR2l0RmFjdG9yeS5nZXRVc2VySW5mbygpLnRoZW4oZnVuY3Rpb24odXNlcikge1xuXHRcdCRzY29wZS51c2VyID0gdXNlci51c2VyO1xuXHRcdCRzY29wZS5kaXNwbGF5TmFtZSA9ICRzY29wZS51c2VyLmdpdGh1Yi5uYW1lO1xuXG5cdH0pXG5cblx0JHNjb3BlLnJlcG9OYW1lID0gcmVwby5uYW1lO1xuXHRjb25zb2xlLmxvZygnZnJvbSB0aGUgY29udHJvbGxlciBpcyB0aGUgcmVwbycsIHJlcG8pXG5cblx0cG9wdXBHaXRGYWN0b3J5Lmxpc3RGaWxlcyhyZXBvKS50aGVuKGZ1bmN0aW9uKHJlcG8pe1xuXG5cdFx0Y29uc29sZS5sb2coJ2xpc3QgZmlsZXMnLCByZXBvKVxuXG5cdFx0cmVwby5maWxlcy5mb3JFYWNoKGZ1bmN0aW9uKGZpbGUpIHtcblx0XHRcdHZhciB1cmwgPSBmaWxlLmZpbGVVcmw7XG5cdFx0XHR2YXIgaSA9IHVybC5tYXRjaCgvYmxvYi8pLmluZGV4ICsgNTtcblx0XHRcdGZpbGUuZGlzcGxheSA9IHVybC5zbGljZShpKTtcblx0XHR9KVxuXHRcdCRzY29wZS5maWxlc1VuZGVyUmVwbyA9IHJlcG8uZmlsZXM7XG5cdH0pXG5cblxuXHQvLyAkc2NvcGUuc2hvd1lvdXJGaWxlcyA9ICRzY29wZS51c2VyLnJlcG9zO1xuXG5cdCRzY29wZS5nb1RvRmlsZSA9IGZ1bmN0aW9uKGZpbGUpIHtcblx0XHRjaHJvbWUudGFicy5jcmVhdGUoe1xuICAgICAgICB1cmw6IGZpbGUuZmlsZVVybFxuICAgIH0pO1xuXHR9XG5cblx0JHNjb3BlLmNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgICRtb2RhbEluc3RhbmNlLmNsb3NlKCk7XG4gIH1cblxuXG59KVxuXG5cblxuLy8gaHR0cHM6Ly9naXRodWIuY29tL255ank4NS9jb2RlX3Jldmlldy9jb21taXQvNGUwZjdlYzMzNTM5ODA0MzE2ZGZmZjc4NmI4MGJlODZkZTY3MmVhNFxuLy8gaHR0cHM6Ly9naXRodWIuY29tL255ank4NS9jb2RlX3Jldmlldy9ibG9iL3JpZ2h0Q2xpY2svYnJvd3Nlci9zY3NzL2hvbWUvbWFpbi5zY3NzXG5cbi8vIEJyYW5jaDogcmlnaHRDbGlja1xuLy8gUmVwbyBOYW1lOiBjb2RlX3Jldmlld1xuLy8gRmlsZXM6IC9icm93c2VyL3Njc3MvaG9tZS9tYWluLnNjc3NcbiIsIid1c2Ugc3RyaWN0JztcbmFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cdCRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdob21lJywge1xuXHRcdHVybDogJy9ob21lJyxcblx0XHR0ZW1wbGF0ZVVybDogJ2pzL2FwcGxpY2F0aW9uL3N0YXRlcy9ob21lL2hvbWUuaHRtbCcsXG5cdFx0Y29udHJvbGxlcjogJ0hvbWVDdHJsJyxcblx0XHRyZXNvbHZlOiB7XG5cdFx0XHRBdXRoZW50aWNhdGU6IGZ1bmN0aW9uKCRodHRwLCAkc3RhdGUpIHtcblx0XHRcdFx0JGh0dHAuZ2V0KFwiaHR0cDovL2xvY2FsaG9zdDoxMzM3L3Nlc3Npb25cIikudGhlbihmdW5jdGlvbihyZXMpIHtcblx0XHRcdFx0XHRpZiAocmVzLmRhdGEpIHtcblx0XHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRcdCRzdGF0ZS5nbygnbG9naW4nKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcbn0pO1xuXG5hcHAuY29udHJvbGxlcignSG9tZUN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCAkc3RhdGUsIHBvcHVwR2l0RmFjdG9yeSwgJHRpbWVvdXQsICRtZFNpZGVuYXYsICRtZFV0aWwsICRsb2csICRtb2RhbCwgJG1kRGlhbG9nKSB7XG5cbiAgcG9wdXBHaXRGYWN0b3J5LmdldFVzZXJJbmZvKCkudGhlbihmdW5jdGlvbih1c2VyKSB7XG5cdFx0JHNjb3BlLnVzZXIgPSB1c2VyO1xuXHRcdCRzY29wZS50b2tlbk9iaiA9IHt0b2tlbjogJHNjb3BlLnVzZXIuZ2l0aHViLnRva2VufTtcblx0XHQkc2NvcGUuc2hvd1JlcG9zID0gJHNjb3BlLnVzZXIucmVwb3M7XG5cdFx0JHNjb3BlLmxvYWRSZXBvcygpO1xuXHR9KVxuXG5cdCRzY29wZS5sb2FkUmVwb3MgPSBmdW5jdGlvbiAoKSB7XG5cdFx0cG9wdXBHaXRGYWN0b3J5LmdldFJlcG9zVG9BZGQoJHNjb3BlLnRva2VuT2JqKVxuXHRcdC50aGVuKGZ1bmN0aW9uKHJlcG9zKSB7XG5cdFx0XHRcdCRzY29wZS5yZXBvc1RvQWRkID0gcmVwb3M7XG5cdFx0fSkuY2F0Y2goJGxvZy5sb2cuYmluZCgkbG9nKSk7XG5cdH1cblxuXG5cdCRzY29wZS50b2dnbGVBZGRCYXIgPSBmdW5jdGlvbiAoKSB7XG5cdFx0JHNjb3BlLnNob3dBZGRCYXIgPSAhJHNjb3BlLnNob3dBZGRCYXI7XG5cdH1cblxuXG5cdHZhciBjYW5ub3RBZGRCb3ggPSBmdW5jdGlvbiAoKSB7XG5cdFx0JG1kRGlhbG9nLnNob3coXG5cdFx0JG1kRGlhbG9nLmFsZXJ0KClcblx0XHRcdC5wYXJlbnQoYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmJvZHkpKVxuXHRcdFx0LnRpdGxlKCdVbmZvcnR1bmF0ZWx5Jylcblx0XHRcdC5jb250ZW50KCdZb3UgY2Fubm90IGFkZCBhIHJlcG8geW91IGFscmVhZHkgYWRkZWQuJylcblx0XHRcdC5vaygnR290IGl0IScpXG5cdFx0KTtcblx0fVxuXG5cdCRzY29wZS5hZGRSZXBvID0gZnVuY3Rpb24gKHJlcG8pIHtcblxuXHRcdFx0cG9wdXBHaXRGYWN0b3J5LmdldENvbnRyaWJ1dG9ycyhyZXBvLmNvbnRyaWJ1dG9yc191cmwpXG5cdFx0XHQudGhlbihmdW5jdGlvbihuYW1lcykge1xuXHRcdFx0XHRyZXBvLmNvbnRyaWJ1dG9ycyA9IG5hbWVzO1xuXG5cdFx0XHRcdHZhciBzYXZlcmVwbyA9IHtuYW1lOiByZXBvLm5hbWUsIHVybDogcmVwby5odG1sX3VybCwgY29udHJpYnV0b3JzOiByZXBvLmNvbnRyaWJ1dG9yc31cblxuXHRcdFx0XHQvL2NyZWF0ZSBSZXBvIGlmIGl0IGRvZXNuJ3QgZXhpc3QgaW4gdGhlIFJlcG8uZGIgKyBhZGQgcmVwbyB0byBVc2VyLmRiXG5cdFx0XHRcdHBvcHVwR2l0RmFjdG9yeS5yZXBvRmluZE9ySW5zZXJ0KHNhdmVyZXBvKS50aGVuKGZ1bmN0aW9uKHJlc0RhdGEpIHtcblx0XHRcdFx0XHRpZighcmVzRGF0YS51c2VyQWxyZWFkeUhhZCkge1xuXHRcdFx0XHRcdFx0JHNjb3BlLnVzZXIucmVwb3MucHVzaChyZXNEYXRhLnJlcG8pO1xuXHRcdFx0XHRcdFx0Y2hyb21lUmVmcmVzaCgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIGNhbm5vdEFkZEJveCgpO1xuXG5cdFx0XHRcdH0pXG5cdFx0XHR9KVxuXHR9XG5cblx0JHNjb3BlLmRlbGV0ZVJlcG8gPSBmdW5jdGlvbihyZXBvKSB7XG5cdFx0Y29uc29sZS5sb2coJ2RlbGV0aW5nIHJlcG8nKVxuXG5cdFx0dmFyIGNvbmZpcm0gPSAkbWREaWFsb2cuY29uZmlybSgpXG4gICAgICAucGFyZW50KGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5ib2R5KSlcbiAgICAgIC50aXRsZSgnQ29uZmlybScpXG4gICAgICAuY29udGVudCgnV291bGQgeW91IGxpa2UgdG8gZGVsZXRlIHRoaXMgcmVwbz8nKVxuICAgICAgLm9rKCdZZXMhJylcbiAgICAgIC5jYW5jZWwoJ05vIScpO1xuXG5cdFx0JG1kRGlhbG9nLnNob3coY29uZmlybSkudGhlbihmdW5jdGlvbigpIHtcblx0XHRcdC8vYWZ0ZXIgY29uZmlybSBkZWxldGVcblx0XHRcdGNvbnNvbGUubG9nKCd1c2VycyByZXBvJywgJHNjb3BlLnVzZXIucmVwb3MpXG5cdFx0XHQkc2NvcGUudXNlci5yZXBvcy5mb3JFYWNoKGZ1bmN0aW9uKHVzZXJyZXBvLCBpKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCd1c2VycmVwbyBpbiBkZWxldGVyZXBvISEhJywgdXNlcnJlcG8sIHJlcG8pXG5cdFx0XHRcdGlmICh1c2VycmVwby5faWQgPT09IHJlcG8uX2lkKSAkc2NvcGUudXNlci5yZXBvcy5zcGxpY2UoaSwxKTtcblx0XHRcdH0pXG5cdFx0XHRwb3B1cEdpdEZhY3RvcnkuZWRpdFJlcG8oJHNjb3BlLnVzZXIpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG5cdFx0XHRcdGNocm9tZVJlZnJlc2goKTtcblx0XHRcdH0pXG5cbiAgICB9KTtcblxuXHR9XG5cblx0JHNjb3BlLmdvQXJjaGl2ZSA9IGZ1bmN0aW9uKCkge1xuXHRcdCRzdGF0ZS5nbygnYXJjaGl2ZScpO1xuXHR9XG5cblx0JHNjb3BlLmFyY2hpdmVSZXBvID0gZnVuY3Rpb24ocmVwbykge1xuXHRcdHZhciBjb25maXJtID0gJG1kRGlhbG9nLmNvbmZpcm0oKVxuICAgICAgLnBhcmVudChhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuYm9keSkpXG4gICAgICAudGl0bGUoJ0NvbmZpcm0nKVxuICAgICAgLmNvbnRlbnQoJ1dvdWxkIHlvdSBsaWtlIHRvIGFyY2hpdmUgdGhpcyByZXBvPycpXG4gICAgICAub2soJ1llcyEnKVxuICAgICAgLmNhbmNlbCgnTm8hJyk7XG5cblx0XHQkbWREaWFsb2cuc2hvdyhjb25maXJtKS50aGVuKGZ1bmN0aW9uKCkge1xuXHRcdFx0Ly9hZnRlciBjb25maXJtIHRvIGFyY2hpdmVcblx0XHRcdC8vYWRkIHJlcG8gdG8gdXNlci5hcmNoaXZlc1xuXHRcdFx0JHNjb3BlLnVzZXIuYXJjaGl2ZXMucHVzaChyZXBvKTtcblx0XHRcdGNvbnNvbGUubG9nKCRzY29wZS51c2VyLmFyY2hpdmVzKTtcblx0XHRcdHBvcHVwR2l0RmFjdG9yeS5hcmNoaXZlUmVwbygkc2NvcGUudXNlcikudGhlbihmdW5jdGlvbihyZXMpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coJ2FyY2hpdmVkIHRvIGRiJywgcmVzKVxuXHRcdFx0fSlcblxuXHRcdFx0Ly9kZWxldGUgcmVwbyBmcm9tIHVzZXIucmVwb3Ncblx0XHRcdCRzY29wZS51c2VyLnJlcG9zLmZvckVhY2goZnVuY3Rpb24odXNlcnJlcG8sIGkpIHtcblx0XHRcdFx0aWYgKHVzZXJyZXBvLl9pZCA9PT0gcmVwby5faWQpICRzY29wZS51c2VyLnJlcG9zLnNwbGljZShpLDEpO1xuXHRcdFx0fSlcblx0XHRcdHBvcHVwR2l0RmFjdG9yeS5lZGl0UmVwbygkc2NvcGUudXNlcikudGhlbihmdW5jdGlvbihyZXMpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coJ2RlbGV0ZWQgcmVwbycsIHJlcylcblx0XHRcdH0pXG5cbiAgICB9KTtcblxuXHR9XG5cblx0JHNjb3BlLmdvVG9SZXBvID0gZnVuY3Rpb24ocmVwbykge1xuXHRcdGNocm9tZS50YWJzLmNyZWF0ZSh7XG4gICAgICAgIHVybDogcmVwby51cmxcbiAgICB9KTtcblx0fVxuXG5cdC8vbGlzdCBmaWxlcyB1bmRlciBhIHJlcG9cblx0JHNjb3BlLmxpc3RGaWxlcyA9IGZ1bmN0aW9uKHJlcG8pIHtcblx0XHR2YXIgbW9kYWxJbnN0YW5jZSA9ICRtb2RhbC5vcGVuKHtcbiAgICAgIHRlbXBsYXRlVXJsOiAnanMvYXBwbGljYXRpb24vc3RhdGVzL2ZpbGVzL2ZpbGUuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnRmlsZUN0cmwnLFxuICAgICAgcmVzb2x2ZToge1xuICAgICAgICByZXBvOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gcmVwbztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXHR9XG5cblx0Ly9sb2cgb3V0XG5cdCRzY29wZS5sb2dvdXQgPSBmdW5jdGlvbiAoKSB7XG5cdFx0cG9wdXBHaXRGYWN0b3J5LmxvZ291dCgpLnRoZW4oZnVuY3Rpb24ocmVzKXtcblx0XHRcdCRzdGF0ZS5nbygnbG9naW4nKTtcblx0XHRcdC8vIGNocm9tZS50YWJzLnF1ZXJ5KHt0aXRsZTogJ0hpZ2hsaWdodCBZb3VyIFdvcmxkJ30sIGZ1bmN0aW9uKHRhYnMpe1xuICAgLy8gICAgICAgIFx0XHR0YWJzLmZvckVhY2goZnVuY3Rpb24odGFiKXtcbiAgIC8vICAgICAgICAgIFx0Y2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UodGFiLmlkLCBtZXNzYWdlOiAnbG9nb3V0Jyk7XG4gICAvLyAgICAgICAgICBcdH0pXG4gICAvLyAgICAgICAgXHR9KTtcblx0XHR9KVxuXHR9XG5cblx0Ly9zaWRlYmFyXG5cdCRzY29wZS50b2dnbGVMZWZ0ID0gYnVpbGRUb2dnbGVyKCdsZWZ0Jyk7XG5cblx0ZnVuY3Rpb24gYnVpbGRUb2dnbGVyKG5hdklEKSB7XG4gICAgICB2YXIgZGVib3VuY2VGbiA9ICAkbWRVdGlsLmRlYm91bmNlKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAkbWRTaWRlbmF2KG5hdklEKVxuICAgICAgICAgICAgICAudG9nZ2xlKClcbiAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICRsb2cuZGVidWcoXCJ0b2dnbGUgXCIgKyBuYXZJRCArIFwiIGlzIGRvbmVcIik7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0sMzAwKTtcbiAgICAgIHJldHVybiBkZWJvdW5jZUZuO1xuICB9XG5cblx0JHNjb3BlLmNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgICAgJG1kU2lkZW5hdignbGVmdCcpLmNsb3NlKClcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICRsb2cuZGVidWcoXCJjbG9zZSBMRUZUIGlzIGRvbmVcIik7XG4gICAgICAgIH0pO1xuICBcdH07XG5cbiAgXHRmdW5jdGlvbiBjaHJvbWVSZWZyZXNoICgpIHtcbiAgXHRcdGNocm9tZS50YWJzLnF1ZXJ5KHt0aXRsZTogJ0hpZ2hsaWdodCBZb3VyIFdvcmxkJ30sIGZ1bmN0aW9uKHRhYnMpe1xuXHRcdHRhYnMuZm9yRWFjaChmdW5jdGlvbih0YWIpe1xuXHRcdFx0Y2hyb21lLnRhYnMucmVsb2FkKHRhYi5pZCk7XG5cdFx0XHR9KVxuXHRcdH0pXG4gIFx0fTtcblxufSlcbiIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cdCRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdsb2dpbicsIHtcblx0XHR1cmw6ICcvJyxcblx0XHR0ZW1wbGF0ZVVybDogJ2pzL2FwcGxpY2F0aW9uL3N0YXRlcy9sb2dpbi9sb2dpbi5odG1sJyxcblx0XHRjb250cm9sbGVyOiAnTG9naW5Db250cm9sbGVyJyxcblx0XHRyZXNvbHZlOiB7XG5cdFx0XHRMb2dpbjogZnVuY3Rpb24oJGh0dHAsICRzdGF0ZSkge1xuXHRcdFx0XHQkaHR0cC5nZXQoXCJodHRwOi8vbG9jYWxob3N0OjEzMzcvc2Vzc2lvblwiKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuXHRcdFx0XHRcdGlmKHJlcy5kYXRhKSB7XG5cdFx0XHRcdFx0XHQkc3RhdGUuZ28oJ2hvbWUnKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcbn0pO1xuXG5hcHAuY29udHJvbGxlcignTG9naW5Db250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGUsIHBvcHVwR2l0RmFjdG9yeSl7XG4gICRzY29wZS5tZXNzYWdlID0gXCJDaGVjayB0aGlzIHBhZ2Ugb3V0IG5vdyFcIjtcblxuXHQvLyAkc2NvcGUubG9nZ2VkaW4gPSBmYWxzZTtcblxuXHQkc2NvcGUuZ2l0TG9naW4gPSBmdW5jdGlvbigpIHtcblx0XHQvL25lZWQgdG8gY2hhbmdlIGxvY2FsaG9zdDoxMzM3IHRvIHRoZSBhcHByb3ByaWF0ZSBkb21haW4gbmFtZSBhZnRlciBkZXBsb3ltZW50ISEhXG5cdFx0Y29uc29sZS5sb2coJ2dpdExvZ2luJylcblx0XHQkc2NvcGUuU3VjY2Vzc2Z1bExvZ2luKCk7XG5cdFx0Y2hyb21lLnRhYnMuY3JlYXRlKHtcbiAgICAgICAgdXJsOiBcImh0dHA6Ly9sb2NhbGhvc3Q6MTMzNy9hdXRoL2dpdGh1YlwiXG4gICAgfSk7XG5cblx0fVxuXG5cblx0Ly8gY29uc29sZS5sb2coc2Vzc2lvbilcblxuXG5cdCRzY29wZS5TdWNjZXNzZnVsTG9naW4gPSBmdW5jdGlvbigpIHtcblx0XHRjb25zb2xlLmxvZygnc3VjY2Vzc3VmbGx5IGxvZ2dpbicpXG5cblx0XHQkc3RhdGUuZ28oJ2hvbWUnKVxuXHRcdGdldE5hbWUoKTtcblx0XHQvLyAkc2NvcGUubG9nZ2VkaW4gPSB0cnVlO1xuXHR9XG5cblx0dmFyIGdldE5hbWUgPSBmdW5jdGlvbigpIHtcblx0XHRwb3B1cEdpdEZhY3RvcnkuZ2V0VXNlckluZm8oKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcblx0XHRcdGNvbnNvbGUubG9nKCdnZXROYW1lJywgZGF0YSk7XG5cdFx0XHQvLyAkc2NvcGUubmFtZSA9XG5cdFx0fSlcblx0fVxufSlcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==