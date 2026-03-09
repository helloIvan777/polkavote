// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PolkaVote
 * @dev A decentralized idea board for the Polkadot ecosystem
 * Proposals have a category and a voting deadline.
 */
contract PolkaVote {
    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        string category;
        uint256 voteCount;
        uint256 timestamp;
        uint256 deadline;
    }

    Proposal[] private proposals;
    mapping(uint256 => mapping(address => bool)) private hasVoted;

    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string title);
    event VoteCast(uint256 indexed proposalId, address indexed voter);

    /**
     * @dev Creates a new proposal
     * @param _title            Proposal title (max 200 chars)
     * @param _description      Proposal description (max 1000 chars)
     * @param _category         Category string e.g. "Tech"
     * @param _durationInDays   Voting window in days (1–30)
     */
    function addProposal(
        string memory _title,
        string memory _description,
        string memory _category,
        uint256 _durationInDays
    ) public returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_title).length <= 200, "Title too long (max 200 chars)");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(bytes(_description).length <= 1000, "Description too long (max 1000 chars)");
        require(bytes(_category).length > 0, "Category cannot be empty");
        require(_durationInDays >= 1 && _durationInDays <= 30, "Duration must be 1-30 days");

        uint256 proposalId = proposals.length;
        uint256 deadline = block.timestamp + (_durationInDays * 1 days);

        proposals.push(Proposal({
            id: proposalId,
            proposer: msg.sender,
            title: _title,
            description: _description,
            category: _category,
            voteCount: 0,
            timestamp: block.timestamp,
            deadline: deadline
        }));

        emit ProposalCreated(proposalId, msg.sender, _title);
        return proposalId;
    }

    /**
     * @dev Vote on a proposal — reverts if the voting window has closed
     */
    function vote(uint256 _proposalId) public {
        require(_proposalId < proposals.length, "Proposal does not exist");
        require(block.timestamp < proposals[_proposalId].deadline, "Voting has ended");
        require(!hasVoted[_proposalId][msg.sender], "Already voted on this proposal");

        proposals[_proposalId].voteCount++;
        hasVoted[_proposalId][msg.sender] = true;

        emit VoteCast(_proposalId, msg.sender);
    }

    /**
     * @dev Returns all proposals (ids, proposers, titles, descriptions,
     *      categories, voteCounts, timestamps, deadlines)
     */
    function getAllProposals() public view returns (
        uint256[] memory ids,
        address[] memory proposers,
        string[] memory titles,
        string[] memory descriptions,
        string[] memory categories,
        uint256[] memory voteCounts,
        uint256[] memory timestamps,
        uint256[] memory deadlines
    ) {
        uint256 n = proposals.length;

        ids          = new uint256[](n);
        proposers    = new address[](n);
        titles       = new string[](n);
        descriptions = new string[](n);
        categories   = new string[](n);
        voteCounts   = new uint256[](n);
        timestamps   = new uint256[](n);
        deadlines    = new uint256[](n);

        for (uint256 i = 0; i < n; i++) {
            ids[i]          = proposals[i].id;
            proposers[i]    = proposals[i].proposer;
            titles[i]       = proposals[i].title;
            descriptions[i] = proposals[i].description;
            categories[i]   = proposals[i].category;
            voteCounts[i]   = proposals[i].voteCount;
            timestamps[i]   = proposals[i].timestamp;
            deadlines[i]    = proposals[i].deadline;
        }
    }

    /**
     * @dev Returns a single proposal by ID
     */
    function getProposal(uint256 _proposalId) public view returns (
        uint256 id,
        address proposer,
        string memory title,
        string memory description,
        string memory category,
        uint256 voteCount,
        uint256 timestamp,
        uint256 deadline
    ) {
        require(_proposalId < proposals.length, "Proposal does not exist");
        Proposal memory p = proposals[_proposalId];
        return (p.id, p.proposer, p.title, p.description, p.category, p.voteCount, p.timestamp, p.deadline);
    }

    function checkVoted(uint256 _proposalId, address _voter) public view returns (bool) {
        require(_proposalId < proposals.length, "Proposal does not exist");
        return hasVoted[_proposalId][_voter];
    }

    function getProposalCount() public view returns (uint256) {
        return proposals.length;
    }

    function getTotalVotes() public view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < proposals.length; i++) {
            total += proposals[i].voteCount;
        }
        return total;
    }
}
