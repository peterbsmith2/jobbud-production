jobApp.factory('Session', function ($resource) {
  return $resource('/auth/session/');
});
