angular.module('typeaheadCtrl',['typeaheadService'])

.controller('typeaheadCtrl', function($scope, $http,College) {

    var vm = this;

        vm.processing = true;
        vm.error ='';

        $scope.restaurant = function(){
            return $http.get('/allcollege')
                .then(function(res){
                    return data
                })
        }

        $scope.selected = undefined;
        $scope.college= College
            .search(function (data) {
                     {
                        vm.college = data.data;


                    }
            });

    $scope.value='';

    $scope.getValue=function(val){
    }
    $scope.doSearch= function () {

        vm.processing = true;
        vm.error = '';
        College.searchRest($scope.value)
            .success(function (data) {
                vm.processing = false;
                vm.college = data.data;
                $scope.restaurant= JSON.stringify(data);
                console.log($scope.restaurant);
                return $scope.restaurant;
            })

            }

})
