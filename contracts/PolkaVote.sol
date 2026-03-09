// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PolkaVote
 * @dev A decentralized idea board for the Polkadot ecosystem
 * Users can submit proposals and vote on them (one vote per address per proposal)
 */
contract PolkaVote {
    // Struct to represent a proposal
    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        uint256 voteCount;
        uint256 timestamp;
    }

    // Storage
    Proposal[] private proposals;
    mapping(uint256 => mapping(address => bool)) private hasVoted;
    
    // Events
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string title);
    event VoteCast(uint256 indexed proposalId, address indexed voter);

    /**
     * @dev Creates a new proposal
     * @param _title The title of the proposal
     * @param _description The description of the proposal
     * @return The ID of the newly created proposal
     */
    function addProposal(string memory _title, string memory _description) 
        public 
        returns (uint256) 
    {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_title).length <= 200, "Title too long (max 200 chars)");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(bytes(_description).length <= 1000, "Description too long (max 1000 chars)");

        uint256 proposalId = proposals.length;
        
        proposals.push(Proposal({
            id: proposalId,
            proposer: msg.sender,
            title: _title,
            description: _description,
            voteCount: 0,
            timestamp: block.timestamp
        }));

        emit ProposalCreated(proposalId, msg.sender, _title);
        
        return proposalId;
    }

    /**
     * @dev Allows an address to vote on a proposal
     * @param _proposalId The ID of the proposal to vote on
     */
    function vote(uint256 _proposalId) public {
        require(_proposalId < proposals.length, "Proposal does not exist");
        require(!hasVoted[_proposalId][msg.sender], "Already voted on this proposal");

        proposals[_proposalId].voteCount++;
        hasVoted[_proposalId][msg.sender] = true;

        emit VoteCast(_proposalId, msg.sender);
    }

    /**
     * @dev Returns all proposals
     * @return Array of all proposal data
     */
    function getAllProposals() public view returns (
        uint256[] memory ids,
        address[] memory proposers,
        string[] memory titles,
        string[] memory descriptions,
        uint256[] memory voteCounts,
        uint256[] memory timestamps
    ) {
        uint256 proposalCount = proposals.length;
        
        ids = new uint256[](proposalCount);
        proposers = new address[](proposalCount);
        titles = new string[](proposalCount);
        descriptions = new string[](proposalCount);
        voteCounts = new uint256[](proposalCount);
        timestamps = new uint256[](proposalCount);

        for (uint256 i = 0; i < proposalCount; i++) {
            ids[i] = proposals[i].id;
            proposers[i] = proposals[i].proposer;
            titles[i] = proposals[i].title;
            descriptions[i] = proposals[i].description;
            voteCounts[i] = proposals[i].voteCount;
            timestamps[i] = proposals[i].timestamp;
        }

        return (ids, proposers, titles, descriptions, voteCounts, timestamps);
    }

    /**
     * @dev Returns a single proposal by ID
     * @param _proposalId The ID of the proposal
     * @return id, proposer, title, description, voteCount, timestamp
     */
    function getProposal(uint256 _proposalId) public view returns (
        uint256 id,
        address proposer,
        string memory title,
        string memory description,
        uint256 voteCount,
        uint256 timestamp
    ) {
        require(_proposalId < proposals.length, "Proposal does not exist");
        
        Proposal memory proposal = proposals[_proposalId];
        return (
            proposal.id,
            proposal.proposer,
            proposal.title,
            proposal.description,
            proposal.voteCount,
            proposal.timestamp
        );
    }

    /**
     * @dev Check if an address has voted on a proposal
     * @param _proposalId The ID of the proposal
     * @param _voter The address to check
     * @return True if the address has voted
     */
    function checkVoted(uint256 _proposalId, address _voter) public view returns (bool) {
        require(_proposalId < proposals.length, "Proposal does not exist");
        return hasVoted[_proposalId][_voter];
    }

    /**
     * @dev Returns the total number of proposals
     * @return The count of proposals
     */
    function getProposalCount() public view returns (uint256) {
        return proposals.length;
    }

    /**
     * @dev Returns the total number of votes across all proposals
     * @return The total vote count
     */
    function getTotalVotes() public view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < proposals.length; i++) {
            total += proposals[i].voteCount;
        }
        return total;
    }
}
