angular.module('typeaheadService',[])

    .factory('College', function ($http) {
        var collegeFactory = {};

        collegeFactory.search = function(){

            return $http.get('/api/allcollegename',{
                params:{
                    name: name
                }

            }).then(function(res){
                var name =[];
                angular.forEach(res.data,function(item){
                    name.push(item.name);
                });
                return name;
            });
        }

        collegeFactory.searchRest = function(value){

            return $http.post('/api/findrestbycollege', {
                college: value
            }) .success(function(res){
                var name =[];
                angular.forEach(res.data,function(item){
                    name.push(item.name);
                });
                return name;

            })
        }




        return collegeFactory;
    });
