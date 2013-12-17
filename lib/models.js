//Shared
/**
 * question model
 * {
 *   title: string,
 *   responseN: int,
 *   responseY: int,
 *   responses: [
 *     {
 *       responder: Meteor.user(),
 *       response: string
 *     }
 *   ],
 *   created: {
 *     by: Meteor.user(),
 *     at: Date()
 *   }
 * }
 */

Questions = new Meteor.Collection("questions", {
  transform: function (doc) {
    var _y = doc.responseY || 0,
        _n = doc.responseN || 0,
        _tot = _y + _n,
        _percentY = _y / _tot * 100,
        _percentN = _n / _tot * 100;
    return _.extend(doc, {percentY: _percentY+'%', percentN: _percentN+'%'});
  }
});