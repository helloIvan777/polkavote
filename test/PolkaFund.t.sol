// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {PolkaFund} from "../src/PolkaFund.sol";

contract PolkaFundTest is Test {
    PolkaFund public polkaFund;

    address public owner = address(0x1);
    address public user1 = address(0x2);
    address public user2 = address(0x3);

    function setUp() public {
        vm.prank(owner);
        polkaFund = new PolkaFund();
    }

    function test_CreateProject() public {
        string memory title = "Polka Innovation";
        string memory desc = "AI and Blockchain integration";
        uint256 goal = 10 ether;
        uint256 duration = 7;

        vm.prank(user1);
        uint256 projectId = polkaFund.addProject(title, desc, "Tech", goal, duration);

        PolkaFund.Project memory p = polkaFund.getProject(projectId);

        assertEq(p.id, projectId, "Project ID mismatch");
        assertEq(p.creator, user1, "Creator address mismatch");
        assertEq(p.title, title, "Title mismatch");
        assertEq(p.description, desc, "Description mismatch");
        assertEq(p.category, "Tech", "Category mismatch");
        assertEq(p.targetAmount, goal, "Target amount mismatch");
        assertEq(p.currentAmount, 0, "Initial current amount should be 0");
        assertTrue(p.deadline > block.timestamp, "Deadline must be in the future");
        assertTrue(p.active, "Project should be marked as active");
    }

    function test_Contribute() public {
        vm.prank(user1);
        uint256 projectId = polkaFund.addProject("Test", "Desc", "Tech", 5 ether, 7);

        vm.deal(user2, 10 ether);

        vm.prank(user2);
        polkaFund.contribute{value: 1 ether}(projectId);

        assertEq(address(polkaFund).balance, 1 ether, "Contract balance mismatch");

        PolkaFund.Project memory p = polkaFund.getProject(projectId);

        assertEq(p.id, projectId, "Project ID mismatch");
        assertEq(p.creator, user1, "Creator address mismatch");
        assertEq(p.title, "Test", "Title mismatch");
        assertEq(p.description, "Desc", "Description mismatch");
        assertEq(p.category, "Tech", "Category mismatch");
        assertEq(p.targetAmount, 5 ether, "Target amount mismatch");
        assertEq(p.currentAmount, 1 ether, "Current amount mismatch after contribution");
        assertTrue(p.deadline > 0, "Deadline must be greater than 0");
        assertTrue(p.active, "Project should remain active");
    }

    function test_Fail_InvalidGoal() public {
        vm.prank(user1);
        vm.expectRevert("Target amount must be > 0");
        polkaFund.addProject("Bad", "Desc", "Tech", 0, 7);
    }

    function testFuzz_Contribute(uint256 amount) public {
        vm.assume(amount > 0 && amount < 100 ether);

        vm.prank(user1);
        uint256 projectId = polkaFund.addProject("Fuzz Project", "Desc", "Tech", 500 ether, 7);

        vm.deal(user2, 100 ether);
        vm.prank(user2);
        polkaFund.contribute{value: amount}(projectId);

        PolkaFund.Project memory p = polkaFund.getProject(projectId);
        assertEq(p.currentAmount, amount, "Fuzz target amount mismatch");
        assertEq(address(polkaFund).balance, amount, "Fuzz contract balance mismatch");
    }
}
