// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {getCurrentUserId, getStatusForUserId, getUser} from 'mattermost-redux/selectors/entities/users';
import {
    getCurrentTeam,
    getCurrentRelativeTeamUrl,
    getTeamMember,
} from 'mattermost-redux/selectors/entities/teams';
import {
    getCurrentChannel,
    getChannelMembersInChannels,
    canManageAnyChannelMembersInCurrentTeam,
} from 'mattermost-redux/selectors/entities/channels';
import {GenericAction} from 'mattermost-redux/types/actions';

import {openDirectChannelToUserId} from 'actions/channel_actions.jsx';
import {getMembershipForCurrentEntities} from 'actions/views/profile_popover';
import {closeModal, openModal} from 'actions/views/modals';

import {areTimezonesEnabledAndSupported} from 'selectors/general';
import {getSelectedPost, getRhsState} from 'selectors/rhs';

import {GlobalState} from 'types/store';

import ProfilePopover from './profile_popover';

type Props = {
    userId: string;
    src: string;
    overwriteIcon?: string,
    hideStatus?: boolean;
    hide?: () => void;
    isRHS?: boolean;
    hasMention?: boolean;
    overwriteName?: React.ReactNode;
}

function mapStateToProps(state: GlobalState, ownProps: Props) {
    const userId = ownProps.userId;
    const team = getCurrentTeam(state);
    const teamMember = getTeamMember(state, team.id, userId);

    let isTeamAdmin = false;
    if (teamMember && teamMember.scheme_admin) {
        isTeamAdmin = true;
    }

    const selectedPost = getSelectedPost(state);
    const currentChannel = getCurrentChannel(state);

    const channelId = selectedPost ? selectedPost.channel_id : currentChannel.id;

    const channelMember = getChannelMembersInChannels(state)[channelId][userId];

    let isChannelAdmin = false;
    if (getRhsState(state) !== 'search' && channelMember != null && channelMember.scheme_admin) {
        isChannelAdmin = true;
    }

    return {
        currentTeamId: team.id,
        currentUserId: getCurrentUserId(state),
        enableTimezone: areTimezonesEnabledAndSupported(state),
        isTeamAdmin,
        isChannelAdmin,
        isInCurrentTeam: teamMember ? Boolean(teamMember) && teamMember.delete_at === 0 : false,
        canManageAnyChannelMembersInCurrentTeam: canManageAnyChannelMembersInCurrentTeam(state),
        status: getStatusForUserId(state, userId),
        teamUrl: getCurrentRelativeTeamUrl(state),
        user: getUser(state, userId),
        modals: state.views.modals.modalState,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            closeModal,
            openDirectChannelToUserId,
            openModal,
            getMembershipForCurrentEntities,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfilePopover);
