# BitBurner-Scripts
A collection of my BitBurner scripts

# Basic Rules
These are the self-imposed rules that I refer to when creating new scripts for my game.

* Anything that can be automated through the in-game API must be automated.
* All automation should be handled by a main script.
   * The main script should be fire-and-forget so it can be launched at the start of any new save and left untouched unless directly modified.
   * The main script should take the fewest possible number of arguments.
* Aside from exploits, variables should not have a hardcoded assignment.
   * Regex constants can be hardcoded.


# Exploit Rules

* Bypassing the cost of in-game API calls is not allowed.
* Bypassing the cost of call DOM methods is allowed.
* Accessing information through DOM properties is allowed.
* Using DOM exploits to change the game behavior or automate things is allowed.
* Editing player properties is not allowed.
* Editing the save is not allowed.


# Current Goals:
- [x] Automated server purchasing and upgrading
- [x] Automated hacknet node purchasing and upgrading
- [ ] Automated darkweb purchases
- [ ] Implement [BB-Vue](https://github.com/smolgumball/bb-vue)
- [ ] Automated crime
- [x] Automated infiltrations
- [ ] Automated infiltration rewards
- [ ] Automated stock trading
- [ ] Eat some noodles
- [x] Automated Weaken/Grow/Hack: targeting the most expensive server that can be hacked
- [ ] Improved Weaken/Grow/Hack: separate threads for Weaken, Grow and Hack
- [ ] Automated augmentation purchase
- [ ] Automated job/gym/university
- [ ] Automated backdooring
