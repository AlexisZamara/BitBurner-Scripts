# BitBurner-Scripts
A collection of my BitBurner scripts

# Basic Rules
These are the self-imposed rules that I refer to when creating new scripts for my game.

* Anything that can be automated through the in-game API must be automated.
* All automation should be handled by a main script.
   * The main script should be fire-and-forget.
   * The main script should take the fewest possible number of arguments.
* Limit the use of constants and hardcoded variables to exploits, regex, filenames and integers.


# Exploit Rules

* Bypassing the cost of call DOM methods is allowed.
* Accessing information through DOM properties is allowed.
* Using localStorage and sessionStorage to bypass the port limitations is allowed.
* Using DOM exploits to change the game behavior or automate things is allowed.
* Editing player properties is not allowed.
* Editing the save is not allowed.
* Bypassing the cost of in-game API calls is not allowed.


# Current Goals:
- [x] Automated server purchasing and upgrading
- [x] Automated hacknet node purchasing and upgrading
- [ ] Automated augmentation purchase
- [ ] Automated darkweb purchases
- [x] Automated crime
- [x] Automated infiltrations
- [x] Automated infiltration rewards
- [x] Automated stock trading
- [x] Basic HWGW batch thing
- [ ] Improved HWGW batcher
- [x] Automated GW of unmaxed servers
- [ ] Automated job/gym/university/faction
- [x] Automated backdooring
- [ ] Automated programming
- [x] Eat some noodles
- [x] Click on some illegal stuff
- [ ] Figure out the other exploits
- [ ] Implement [BB-Vue](https://github.com/smolgumball/bb-vue)

# Known Issues:
- Noodles devourer causes lag due to toasts.
- Automated infiltration does not consistently trigger onSuccess(), work on a solving algorithm has started
