// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * This module handles the in page replying to forum posts.
 *
 * @module     mod_forum/inpage_reply
 * @package    mod_forum
 * @copyright  2019 Peter Dias
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
define([
        'jquery',
        'core/templates',
        'core/notification',
        'mod_forum/repository',
        'mod_forum/selectors',
    ], function(
        $,
        Templates,
        Notification,
        Repository,
        Selectors
    ) {

    var DISPLAYCONSTANTS = {
        THREADED: 2,
        NESTED: 3,
        FLAT_OLDEST_FIRST: 1,
        FLAT_NEWEST_FIRST: -1
    };

    /**
     * Show the loading icon for the submit button.
     *
     * @param {Object} button The submit button element
     */
    var showSubmitButtonLoadingIcon = function(button) {
        var textContainer = button.find(Selectors.post.inpageSubmitBtnText);
        var loadingIconContainer = button.find(Selectors.post.loadingIconContainer);
        var width = button.outerWidth();
        // Fix the width so that the button size doesn't change when we show the loading icon.
        button.css('width', width);
        textContainer.addClass('hidden');
        loadingIconContainer.removeClass('hidden');
    };

    /**
     * Hide the loading icon for the submit button.
     *
     * @param {Object} button The submit button element
     */
    var hideSubmitButtonLoadingIcon = function(button) {
        var textContainer = button.find(Selectors.post.inpageSubmitBtnText);
        var loadingIconContainer = button.find(Selectors.post.loadingIconContainer);
        // Reset the width back to it's default.
        button.css('width', '');
        textContainer.removeClass('hidden');
        loadingIconContainer.addClass('hidden');
    };

    /**
     * Register the event listeners for the submit button of the in page reply.
     *
     * @param {Object} root The discussion container element.
     */
    var registerEventListeners = function(root) {
        root.on('click', Selectors.post.inpageSubmitBtn, function(e) {
            e.preventDefault();
            var submitButton = $(e.currentTarget);
            var allButtons = submitButton.parent().find(Selectors.post.inpageReplyButton);
            var form = submitButton.parents(Selectors.post.inpageReplyForm).get(0);
            var message = form.elements.post.value.trim();
            var postid = form.elements.reply.value;
            var subject = form.elements.subject.value;
            var currentRoot = submitButton.parents(Selectors.post.forumContent);
            var mode = parseInt(root.find(Selectors.post.modeSelect).get(0).value);
            var newid;

            if (message.length) {
                showSubmitButtonLoadingIcon(submitButton);
                allButtons.prop('disabled', true);

                Repository.addDiscussionPost(postid, subject, message)
                    .then(function(context) {
                        var message = context.messages.reduce(function(carry, message) {
                            if (message.type == 'success') {
                                carry += '<p>' + message.message + '</p>';
                            }
                            return carry;
                        }, '');
                        Notification.addNotification({
                            message: message,
                            type: "success"
                        });

                        return context;
                    })
                    .then(function(context) {
                        form.reset();
                        var post = context.post;
                        newid = post.id;
                        switch (mode) {
                            case DISPLAYCONSTANTS.THREADED:
                                return Templates.render('mod_forum/forum_discussion_threaded_post', post);
                            case DISPLAYCONSTANTS.NESTED:
                                return Templates.render('mod_forum/forum_discussion_nested_post', post);
                            default:
                                return Templates.render('mod_forum/forum_discussion_post', post);
                        }
                    })
                    .then(function(html, js) {
                        var repliesnode;

                        // Try and get the replies-container which can either be a sibling OR parent if it's flat
                        if (mode == DISPLAYCONSTANTS.FLAT_OLDEST_FIRST || mode == DISPLAYCONSTANTS.FLAT_NEWEST_FIRST) {
                            repliesnode = currentRoot.parents(Selectors.post.repliesContainer).children().get(0);
                        }

                        if (repliesnode == undefined) {
                            repliesnode = currentRoot.siblings(Selectors.post.repliesContainer).children().get(0);
                        }

                        if (mode == DISPLAYCONSTANTS.FLAT_NEWEST_FIRST) {
                            return Templates.prependNodeContents(repliesnode, html, js);
                        } else {
                            return Templates.appendNodeContents(repliesnode, html, js);
                        }
                    })
                    .then(function() {
                        hideSubmitButtonLoadingIcon(submitButton);
                        allButtons.prop('disabled', false);
                        return currentRoot.find(Selectors.post.inpageReplyContent).hide();
                    })
                    .then(function() {
                        location.href = "#p" + newid;
                        return;
                    })
                    .catch(function(error) {
                        hideSubmitButtonLoadingIcon(submitButton);
                        allButtons.prop('disabled', false);
                        return Notification.exception(error);
                    });
            }
        });
    };

    return {
        init: function(root) {
            registerEventListeners(root);
        }
    };
});