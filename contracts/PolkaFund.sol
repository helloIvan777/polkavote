// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PolkaFund
 * @dev A decentralised crowdfunding platform for the Polkadot ecosystem.
 *
 * Flow:
 *  1. Creator calls addProject() with a funding target (wei) and deadline duration.
 *  2. Backers call contribute() while the deadline has not passed.
 *  3a. If raisedAmount >= targetAmount after the deadline, the creator calls
 *      withdrawFunds() to receive all collected ETH/DEV.
 *  3b. If raisedAmount < targetAmount after the deadline, each backer calls
 *      claimRefund() to recover their individual contribution.
 */
contract PolkaFund {

    // ─── Data structures ────────────────────────────────────────────────────

    struct Project {
        uint256 id;
        address payable creator;
        string  title;
        string  description;
        string  category;
        uint256 targetAmount;   // funding goal in wei
        uint256 raisedAmount;   // total wei contributed so far
        uint256 timestamp;      // creation time
        uint256 deadline;       // funding closes at this unix timestamp
        bool    withdrawn;      // true once creator has called withdrawFunds
    }

    Project[] private projects;

    /// @dev contributions[projectId][backer] = wei contributed
    mapping(uint256 => mapping(address => uint256)) public contributions;

    // ─── Events ─────────────────────────────────────────────────────────────

    event ProjectCreated(
        uint256 indexed projectId,
        address indexed creator,
        string  title,
        uint256 targetAmount,
        uint256 deadline
    );

    event ContributionMade(
        uint256 indexed projectId,
        address indexed backer,
        uint256 amount,
        uint256 newRaisedAmount
    );

    event FundsWithdrawn(
        uint256 indexed projectId,
        address indexed creator,
        uint256 amount
    );

    event RefundClaimed(
        uint256 indexed projectId,
        address indexed backer,
        uint256 amount
    );

    // ─── Modifiers ───────────────────────────────────────────────────────────

    modifier projectExists(uint256 _projectId) {
        require(_projectId < projects.length, "Project does not exist");
        _;
    }

    // ─── Write functions ─────────────────────────────────────────────────────

    /**
     * @notice Create a new crowdfunding project.
     * @param _title           Project title (max 200 chars)
     * @param _description     Project description (max 1000 chars)
     * @param _category        Category string e.g. "Tech"
     * @param _targetAmount    Funding goal in wei (must be > 0)
     * @param _durationInDays  Funding window in days (1–90)
     */
    function addProject(
        string memory _title,
        string memory _description,
        string memory _category,
        uint256 _targetAmount,
        uint256 _durationInDays
    ) public returns (uint256) {
        require(bytes(_title).length > 0,          "Title cannot be empty");
        require(bytes(_title).length <= 200,       "Title too long (max 200 chars)");
        require(bytes(_description).length > 0,    "Description cannot be empty");
        require(bytes(_description).length <= 1000,"Description too long (max 1000 chars)");
        require(bytes(_category).length > 0,       "Category cannot be empty");
        require(_targetAmount > 0,                 "Target amount must be > 0");
        require(
            _durationInDays >= 1 && _durationInDays <= 90,
            "Duration must be 1-90 days"
        );

        uint256 projectId = projects.length;
        uint256 deadline  = block.timestamp + (_durationInDays * 1 days);

        projects.push(Project({
            id:           projectId,
            creator:      payable(msg.sender),
            title:        _title,
            description:  _description,
            category:     _category,
            targetAmount: _targetAmount,
            raisedAmount: 0,
            timestamp:    block.timestamp,
            deadline:     deadline,
            withdrawn:    false
        }));

        emit ProjectCreated(projectId, msg.sender, _title, _targetAmount, deadline);
        return projectId;
    }

    /**
     * @notice Contribute ETH/DEV to a project.
     * @dev Reverts if the deadline has passed or msg.value is zero.
     * @param _projectId  ID of the project to back
     */
    function contribute(uint256 _projectId)
        public
        payable
        projectExists(_projectId)
    {
        require(block.timestamp < projects[_projectId].deadline, "Funding period has ended");
        require(msg.value > 0, "Contribution must be > 0");

        projects[_projectId].raisedAmount      += msg.value;
        contributions[_projectId][msg.sender]  += msg.value;

        emit ContributionMade(
            _projectId,
            msg.sender,
            msg.value,
            projects[_projectId].raisedAmount
        );
    }

    /**
     * @notice Creator withdraws funds after a successful campaign.
     * @dev Conditions:
     *   - Caller must be the project creator.
     *   - Deadline must have passed.
     *   - raisedAmount >= targetAmount (campaign succeeded).
     *   - Funds must not have been already withdrawn.
     * @param _projectId  ID of the project
     */
    function withdrawFunds(uint256 _projectId)
        public
        projectExists(_projectId)
    {
        Project storage p = projects[_projectId];

        require(msg.sender == p.creator,              "Only the project creator can withdraw");
        require(block.timestamp >= p.deadline,        "Funding period has not ended yet");
        require(p.raisedAmount >= p.targetAmount,     "Funding goal not reached — refunds available");
        require(!p.withdrawn,                         "Funds already withdrawn");

        p.withdrawn = true;
        uint256 amount = p.raisedAmount;

        (bool success, ) = p.creator.call{value: amount}("");
        require(success, "Transfer failed");

        emit FundsWithdrawn(_projectId, p.creator, amount);
    }

    /**
     * @notice Backer claims a refund after a failed campaign.
     * @dev Conditions:
     *   - Deadline must have passed.
     *   - raisedAmount < targetAmount (campaign failed).
     *   - Caller must have a non-zero contribution.
     * @param _projectId  ID of the project
     */
    function claimRefund(uint256 _projectId)
        public
        projectExists(_projectId)
    {
        Project storage p = projects[_projectId];

        require(block.timestamp >= p.deadline,    "Funding period has not ended yet");
        require(p.raisedAmount < p.targetAmount,  "Campaign succeeded — no refunds available");

        uint256 amount = contributions[_projectId][msg.sender];
        require(amount > 0, "No contribution to refund");

        // Zero out before transfer to prevent re-entrancy
        contributions[_projectId][msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Refund transfer failed");

        emit RefundClaimed(_projectId, msg.sender, amount);
    }

    // ─── View functions ───────────────────────────────────────────────────────

    /**
     * @notice Returns all projects as parallel arrays.
     */
    function getAllProjects() public view returns (
        uint256[] memory ids,
        address[] memory creators,
        string[]  memory titles,
        string[]  memory descriptions,
        string[]  memory categories,
        uint256[] memory targetAmounts,
        uint256[] memory raisedAmounts,
        uint256[] memory timestamps,
        uint256[] memory deadlines,
        bool[]    memory withdrawnFlags
    ) {
        uint256 n = projects.length;

        ids            = new uint256[](n);
        creators       = new address[](n);
        titles         = new string[](n);
        descriptions   = new string[](n);
        categories     = new string[](n);
        targetAmounts  = new uint256[](n);
        raisedAmounts  = new uint256[](n);
        timestamps     = new uint256[](n);
        deadlines      = new uint256[](n);
        withdrawnFlags = new bool[](n);

        for (uint256 i = 0; i < n; i++) {
            Project storage p = projects[i];
            ids[i]            = p.id;
            creators[i]       = p.creator;
            titles[i]         = p.title;
            descriptions[i]   = p.description;
            categories[i]     = p.category;
            targetAmounts[i]  = p.targetAmount;
            raisedAmounts[i]  = p.raisedAmount;
            timestamps[i]     = p.timestamp;
            deadlines[i]      = p.deadline;
            withdrawnFlags[i] = p.withdrawn;
        }
    }

    /**
     * @notice Returns a single project by ID.
     */
    function getProject(uint256 _projectId) public view projectExists(_projectId) returns (
        uint256 id,
        address creator,
        string  memory title,
        string  memory description,
        string  memory category,
        uint256 targetAmount,
        uint256 raisedAmount,
        uint256 timestamp,
        uint256 deadline,
        bool    withdrawn
    ) {
        Project storage p = projects[_projectId];
        return (
            p.id, p.creator, p.title, p.description, p.category,
            p.targetAmount, p.raisedAmount, p.timestamp, p.deadline, p.withdrawn
        );
    }

    /**
     * @notice How much a specific backer contributed to a project.
     */
    function getContribution(uint256 _projectId, address _backer)
        public
        view
        projectExists(_projectId)
        returns (uint256)
    {
        return contributions[_projectId][_backer];
    }

    function getProjectCount() public view returns (uint256) {
        return projects.length;
    }
}
