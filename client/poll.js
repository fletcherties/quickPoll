Meteor.startup(function () {
  Session.set('questionId', null);
});

Template.page.events({
  'click .modal .cancel': function (e) {
    console.log('closing the modal');
    $('#viewVotes').modal('hide');
  }
});

Template.home.questions = function () {
  return Questions.find({},{sort: [['created.at','desc']]});
};

Template.home.events({
  'click #btnCreate' : function (e) {
    var _text = $("#txtQuestion").val();
    if (_text) {
      Questions.insert({ 
        text: _text, 
        responseY: 0, 
        responseN: 0, 
        responses: [], 
        created: { by: Meteor.user(), at: new Date() } 
      });
    } else {
      console.log("Oops..");
    }
  }
  , 'click .trash': function (e) {
    var id = $(e.currentTarget).attr('data-id');
    Questions.remove({ _id: id });
  }
  , 'click .reset-votes': function (e) {
    var id = $(e.currentTarget).attr('data-id');
    Questions.update({ _id: id }, { $set: { responseY: 0, responseN: 0, responses: [] } });
  }
  , 'click .view-votes': function (e) {
    var id = $(e.currentTarget).attr('data-id');
    Session.set('questionId', id);
  }
  , 'click .vote': function (e) {
    var $btn = $(e.currentTarget),
        qId = $btn.attr('rel'),
        _val = $btn.val(),
        _field = {},
        query = {};
    
    _field['response'+_val.toUpperCase()] = 1;
    query['$inc'] = _field;
    query['$push'] = { responses: { responder: Meteor.user(), response: _val } };
    
    if (qId && _val) {
      Questions.update({_id: qId}, query);
    } else {
      console.log('Oops...could not cast vote.');
    }
  }
});

Template.question.createdBy = function () {
  var creator = this.created.by || {};
  return creator && displayUserName(creator) || '';
}

Template.question.createdAt = function () {
  return moment(this.created.at).fromNow();
}

Template.question.hasVoted = function () {
  var _found = _.contains(_.pluck(_.pluck(this.responses, 'responder'), '_id'), Meteor.userId());
  return _found;
}

Template.viewVotesDialog.rendered = function () {
  $('#viewVotes').on('hide.bs.modal', function (e) {
    Session.set('questionId', null);
  });
  
  if(Session.get('questionId'))
    $('#viewVotes').modal('show');
}

Template.viewVotesDialog.question = function () {
  var question = Questions.findOne(Session.get('questionId'));
  return question || {};
}

Template.responder.responderName = function () {
  var _responder = this.responder
  return _responder && displayUserName(_responder) || '';
}

var displayUserName = function (user) {
  if (user._id === Meteor.userId()) {
    return 'me';
  } else if(user.profile && user.profile.name) {
    return user.profile.name;
  } else {
    return user.emails[0].address;
  }
}