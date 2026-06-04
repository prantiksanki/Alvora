/**
 * Base adapter for company-specific career page APIs.
 * Extend this class to add custom integrations for companies that expose
 * their own JSON job endpoints (reverse-engineered or documented).
 *
 * Usage:
 *   class AcmeAdapter extends CompanyApiAdapter {
 *     async fetchJobs(companySlug) { ... }
 *     async normalizeJobs(rawJobs, companySlug) { ... }
 *   }
 */
class CompanyApiAdapter {
  /**
   * Fetch raw job listings from the company-specific endpoint.
   * @param {string} companySlug
   * @returns {Promise<object[]>}
   */
  async fetchJobs(_companySlug) {
    throw new Error(`${this.constructor.name}.fetchJobs() not implemented`);
  }

  /**
   * Normalize raw jobs into the unified JobPosting format.
   * @param {object[]} rawJobs
   * @param {string} companySlug
   * @returns {object[]}
   */
  async normalizeJobs(_rawJobs, _companySlug) {
    throw new Error(`${this.constructor.name}.normalizeJobs() not implemented`);
  }
}

module.exports = CompanyApiAdapter;
