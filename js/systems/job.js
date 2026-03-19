/**
 * LATENCY - JobSystem
 * ============================================================
 * Manages career selection, rank progression, salary collection,
 * and job-related unlocks.
 *
 * Dependencies:
 *   - window.Latency.JobsData       (job definitions)
 *   - window.Latency.CharacterSystem (character stats & currency)
 *   - window.Latency.EventBus       (publish/subscribe)
 *
 * Events emitted:
 *   job:set        { jobId, job, rank, title }
 *   job:promoted   { jobId, oldRank, newRank, title, unlocks }
 *   job:salary     { jobId, amount, rank }
 *   job:quit       { jobId, rank }
 * ============================================================
 */

window.Latency = window.Latency || {};

window.Latency.JobSystem = (function () {
    'use strict';

    var EventBus = null;

    function bus() {
        if (!EventBus) {
            EventBus = window.Latency.EventBus;
        }
        return EventBus;
    }

    // ---------------------------------------------------------------
    //  Helpers
    // ---------------------------------------------------------------

    function _getChar() {
        if (window.Latency.CharacterSystem) {
            return window.Latency.CharacterSystem.getCharacter();
        }
        return null;
    }

    function _getJobData(jobId) {
        if (window.Latency.JobsData && window.Latency.JobsData[jobId]) {
            return window.Latency.JobsData[jobId];
        }
        return null;
    }

    function _getRankData(jobData, rank) {
        if (!jobData || !jobData.ranks) { return null; }
        for (var i = 0; i < jobData.ranks.length; i++) {
            if (jobData.ranks[i].rank === rank) {
                return jobData.ranks[i];
            }
        }
        return null;
    }

    /**
     * Check whether the character meets the stat and level
     * requirements for a given rank.
     */
    function _meetsRequirements(character, requirements) {
        if (!requirements || !character) { return true; }

        if (requirements.level && character.level < requirements.level) {
            return false;
        }

        var stats = character.stats || {};
        var reqKeys = Object.keys(requirements);
        for (var i = 0; i < reqKeys.length; i++) {
            var key = reqKeys[i];
            if (key === 'level') { continue; }
            if (stats[key] !== undefined && stats[key] < requirements[key]) {
                return false;
            }
        }

        return true;
    }

    // ---------------------------------------------------------------
    //  Public API
    // ---------------------------------------------------------------

    /**
     * Assign a job to the character at rank 0.
     * @param {string} jobId  Key into Latency.JobsData.
     * @returns {boolean} True if successfully assigned.
     */
    function setJob(jobId) {
        var char = _getChar();
        if (!char) { return false; }

        var jobData = _getJobData(jobId);
        if (!jobData) {
            console.warn('[JobSystem] Unknown job: ' + jobId);
            return false;
        }

        char.job = jobId;
        char.jobRank = 0;

        var rankData = _getRankData(jobData, 0);

        bus().emit('job:set', {
            jobId: jobId,
            job: jobData,
            rank: 0,
            title: rankData ? rankData.title : jobData.name
        });

        return true;
    }

    /**
     * Return the current job data object, or null.
     * @returns {Object|null}
     */
    function getJob() {
        var char = _getChar();
        if (!char || !char.job) { return null; }
        return _getJobData(char.job);
    }

    /**
     * Return the current job rank number.
     * @returns {number}
     */
    function getJobRank() {
        var char = _getChar();
        if (!char) { return 0; }
        return char.jobRank || 0;
    }

    /**
     * Return the rank data object for the current rank.
     * @returns {Object|null}
     */
    function getJobRankData() {
        var char = _getChar();
        if (!char || !char.job) { return null; }
        var jobData = _getJobData(char.job);
        if (!jobData) { return null; }
        return _getRankData(jobData, char.jobRank || 0);
    }

    /**
     * Return the current job title string.
     * @returns {string}
     */
    function getJobTitle() {
        var rankData = getJobRankData();
        if (rankData) { return rankData.title; }
        var job = getJob();
        if (job) { return job.name; }
        return 'Unemployed';
    }

    /**
     * Attempt to promote the character to the next rank.
     * Checks stat and level requirements. Grants unlocks on success.
     * @returns {boolean} True if promoted.
     */
    function promote() {
        var char = _getChar();
        if (!char || !char.job) { return false; }

        var jobData = _getJobData(char.job);
        if (!jobData) { return false; }

        var currentRank = char.jobRank || 0;
        var nextRank = currentRank + 1;
        var nextRankData = _getRankData(jobData, nextRank);

        if (!nextRankData) {
            // Already at max rank
            return false;
        }

        // Check requirements
        if (!_meetsRequirements(char, nextRankData.requirements)) {
            return false;
        }

        var oldRank = currentRank;
        char.jobRank = nextRank;

        // Grant unlocks
        var unlocks = nextRankData.unlocks || [];
        for (var i = 0; i < unlocks.length; i++) {
            if (!char.flags) { char.flags = {}; }
            char.flags[unlocks[i]] = true;
        }

        bus().emit('job:promoted', {
            jobId: char.job,
            oldRank: oldRank,
            newRank: nextRank,
            title: nextRankData.title,
            unlocks: unlocks
        });

        return true;
    }

    /**
     * Collect salary based on current job rank.
     * Credits are added to the character's currency.
     * Enforces a cooldown of at least 1 game-day/turn between collections.
     * @returns {number} The amount earned (0 if no job or on cooldown).
     */
    function collectSalary() {
        var char = _getChar();
        if (!char || !char.job) { return 0; }

        // Cooldown check: require at least 1 game-day/turn between collections
        var currentTurn = (window.Latency.CharacterSystem && window.Latency.CharacterSystem.getTurn)
            ? window.Latency.CharacterSystem.getTurn()
            : (char.turn || char.day || Date.now());

        if (char._lastSalaryTime !== undefined && currentTurn <= char._lastSalaryTime) {
            console.warn('[JobSystem] Salary already collected this turn/day.');
            return 0;
        }

        var jobData = _getJobData(char.job);
        if (!jobData) { return 0; }

        var rankData = _getRankData(jobData, char.jobRank || 0);
        if (!rankData) { return 0; }

        var amount = rankData.salary || 0;
        if (amount <= 0) { return 0; }

        // Record the collection timestamp
        char._lastSalaryTime = currentTurn;

        // Add to character currency
        if (!char.inventory) { char.inventory = { currency: 0 }; }
        char.inventory.currency = (char.inventory.currency || 0) + amount;

        bus().emit('job:salary', {
            jobId: char.job,
            amount: amount,
            rank: char.jobRank || 0
        });

        return amount;
    }

    /**
     * Return an array of job IDs the character qualifies for
     * (based on rank 0 requirements - always empty, so all jobs
     * are available, but filtered by primary stat >= 10).
     * @param {Object} [character] Optional character override.
     * @returns {Array<string>}
     */
    function getAvailableJobs(character) {
        var char = character || _getChar();
        if (!char) { return []; }

        var jobsData = window.Latency.JobsData;
        if (!jobsData) { return []; }

        var available = [];
        var jobIds = Object.keys(jobsData);

        for (var i = 0; i < jobIds.length; i++) {
            var jobId = jobIds[i];
            var job = jobsData[jobId];
            var rank0 = _getRankData(job, 0);

            // Rank 0 requirements are typically empty, but check anyway
            if (rank0 && _meetsRequirements(char, rank0.requirements)) {
                available.push(jobId);
            }
        }

        return available;
    }

    /**
     * Check if the character can be promoted to the next rank.
     * @returns {boolean}
     */
    function canPromote() {
        var char = _getChar();
        if (!char || !char.job) { return false; }

        var jobData = _getJobData(char.job);
        if (!jobData) { return false; }

        var nextRank = (char.jobRank || 0) + 1;
        var nextRankData = _getRankData(jobData, nextRank);
        if (!nextRankData) { return false; }

        return _meetsRequirements(char, nextRankData.requirements);
    }

    /**
     * Quit the current job. Resets job and rank to null/0.
     */
    function quit() {
        var char = _getChar();
        if (!char || !char.job) { return; }

        var oldJob = char.job;
        var oldRank = char.jobRank || 0;

        char.job = null;
        char.jobRank = 0;

        bus().emit('job:quit', {
            jobId: oldJob,
            rank: oldRank
        });
    }

    /**
     * Serialize job state for save data.
     * @returns {Object|null}
     */
    function serialize() {
        var char = _getChar();
        if (!char) { return null; }
        return {
            job: char.job || null,
            jobRank: char.jobRank || 0,
            _lastSalaryTime: char._lastSalaryTime || null
        };
    }

    /**
     * Restore job state from save data.
     * @param {Object} data
     */
    function deserialize(data) {
        var char = _getChar();
        if (!char || !data) { return; }
        char.job = data.job || null;
        char.jobRank = data.jobRank || 0;
        if (data._lastSalaryTime !== undefined) {
            char._lastSalaryTime = data._lastSalaryTime;
        }
    }

    // ---------------------------------------------------------------
    //  Public API
    // ---------------------------------------------------------------

    return {
        setJob:           setJob,
        getJob:           getJob,
        getJobRank:       getJobRank,
        getJobRankData:   getJobRankData,
        getJobTitle:      getJobTitle,
        promote:          promote,
        collectSalary:    collectSalary,
        getAvailableJobs: getAvailableJobs,
        canPromote:       canPromote,
        quit:             quit,
        serialize:        serialize,
        deserialize:      deserialize
    };
})();
