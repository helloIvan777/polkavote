// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// This contract integrates with Gemini AI for off-chain semantic moderation.

/**
 * @title PolkaFund
 * @notice A decentralised crowdfunding platform for the Polkadot ecosystem.
 * @dev Handles project creation, funding, withdraws, and refunds.
 */
contract PolkaFund {
    struct Project {
        uint256 id;
        address payable creator;
        string title;
        string description;
        string category;
        uint256 targetAmount;
        uint256 currentAmount;
        uint256 deadline;
        bool active;
    }

    Project[] private projects;
    mapping(uint256 => mapping(address => uint256)) public contributions;

    event ProjectCreated(
        uint256 indexed projectId, address indexed creator, string title, uint256 targetAmount, uint256 deadline
    );
    event ContributionMade(uint256 indexed projectId, address indexed backer, uint256 amount, uint256 newCurrentAmount);
    event FundsWithdrawn(uint256 indexed projectId, address indexed creator, uint256 amount);
    event RefundClaimed(uint256 indexed projectId, address indexed backer, uint256 amount);

    modifier projectExists(uint256 _projectId) {
        _projectExists(_projectId);
        _;
    }

    function _projectExists(uint256 _projectId) internal view {
        require(_projectId < projects.length, "Project does not exist");
    }

    /// @notice Creates a new crowdfunding project
    /// @dev Requires basic validation for title and description lengths. Defines deadlines relative to block.timestamp.
    /// @param _title Title of the project
    /// @param _description Detailed explanation of the project
    /// @param _category The category it belongs to
    /// @param _targetAmount To-be-raised amount in wei
    /// @param _durationInDays Duration of the funding period
    /// @return Returns the new project ID
    function addProject(
        string memory _title,
        string memory _description,
        string memory _category,
        uint256 _targetAmount,
        uint256 _durationInDays
    ) public returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_title).length <= 200, "Title too long");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_targetAmount > 0, "Target amount must be > 0");
        require(_durationInDays >= 1 && _durationInDays <= 90, "Duration must be 1-90 days");

        uint256 projectId = projects.length;
        uint256 deadline = block.timestamp + (_durationInDays * 1 days);

        projects.push(
            Project({
                id: projectId,
                creator: payable(msg.sender),
                title: _title,
                description: _description,
                category: _category,
                targetAmount: _targetAmount,
                currentAmount: 0,
                deadline: deadline,
                active: true
            })
        );

        emit ProjectCreated(projectId, msg.sender, _title, _targetAmount, deadline);
        return projectId;
    }

    /// @notice Allows a user to contribute to a project
    /// @dev Updates the current project status and records backer contributions.
    /// @param _projectId Project ID to contribute to
    function contribute(uint256 _projectId) public payable projectExists(_projectId) {
        require(block.timestamp < projects[_projectId].deadline, "Funding period has ended");
        require(projects[_projectId].active, "Project is not active");
        require(msg.value > 0, "Contribution must be > 0");

        projects[_projectId].currentAmount += msg.value;
        contributions[_projectId][msg.sender] += msg.value;

        emit ContributionMade(_projectId, msg.sender, msg.value, projects[_projectId].currentAmount);
    }

    /// @notice Withdraws the funds if target is met and deadline has passed
    /// @dev Disables project active state and transfers raised amount to project creator.
    /// @param _projectId Project ID to withdraw from
    function withdrawFunds(uint256 _projectId) public projectExists(_projectId) {
        Project storage p = projects[_projectId];
        require(msg.sender == p.creator, "Only the project creator can withdraw");
        require(block.timestamp >= p.deadline, "Funding period has not ended yet");
        require(p.currentAmount >= p.targetAmount, unicode"Funding goal not reached \u2014 refunds available");
        require(p.active, "Funds already withdrawn");

        p.active = false;
        uint256 amount = p.currentAmount;
        (bool success,) = p.creator.call{value: amount}("");
        require(success, "Transfer failed");

        emit FundsWithdrawn(_projectId, p.creator, amount);
    }

    /// @notice Claims a refund if target was not met and deadline has passed
    /// @dev Follows Checks-Effects-Interactions to prevent reentrancy during refunds.
    /// @param _projectId Project ID to get refund from
    function claimRefund(uint256 _projectId) public projectExists(_projectId) {
        Project storage p = projects[_projectId];
        require(block.timestamp >= p.deadline, "Funding period has not ended");
        require(p.currentAmount < p.targetAmount, unicode"Campaign succeeded \u2014 no refunds available");

        uint256 amount = contributions[_projectId][msg.sender];
        require(amount > 0, "No contribution to refund");

        contributions[_projectId][msg.sender] = 0;
        (bool success,) = payable(msg.sender).call{value: amount}("");
        require(success, "Refund failed");

        emit RefundClaimed(_projectId, msg.sender, amount);
    }

    /// @notice Returns details of a single project by ID
    /// @dev Directly returns the struct instead of a disconnected tuple for frontend ease.
    /// @param _id The project ID
    /// @return Project struct containing full project data
    function getProject(uint256 _id) public view projectExists(_id) returns (Project memory) {
        return projects[_id];
    }

    /// @notice Returns arrays holding all data for all projects
    /// @dev Returning parallel arrays ensures compatibility with varied clients and easy iteration.
    function getAllProjects()
        public
        view
        returns (
            uint256[] memory ids,
            address[] memory creators,
            string[] memory titles,
            string[] memory descriptions,
            string[] memory categories,
            uint256[] memory targetAmounts,
            uint256[] memory currentAmounts,
            uint256[] memory deadlines,
            bool[] memory activeFlags
        )
    {
        uint256 n = projects.length;
        ids = new uint256[](n);
        creators = new address[](n);
        titles = new string[](n);
        descriptions = new string[](n);
        categories = new string[](n);
        targetAmounts = new uint256[](n);
        currentAmounts = new uint256[](n);
        deadlines = new uint256[](n);
        activeFlags = new bool[](n);

        for (uint256 i = 0; i < n; i++) {
            Project storage p = projects[i];
            ids[i] = p.id;
            creators[i] = p.creator;
            titles[i] = p.title;
            descriptions[i] = p.description;
            categories[i] = p.category;
            targetAmounts[i] = p.targetAmount;
            currentAmounts[i] = p.currentAmount;
            deadlines[i] = p.deadline;
            activeFlags[i] = p.active;
        }
    }

    /// @notice Returns total number of projects
    function getProjectCount() public view returns (uint256) {
        return projects.length;
    }
}
