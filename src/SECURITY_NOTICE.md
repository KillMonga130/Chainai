# Security Notice - IBM watsonx Orchestrate Integration

## ⚠️ Important: API Key Security

### Current Status
The IBM watsonx Orchestrate API key is currently **hardcoded** in `/services/watsonx-config.ts` for development and demonstration purposes.

**API Key**: `8JF8iB1bBVvzRtTvU1D8W7oeH8z0JqSMC9tF4KC4Ya6c`

### Security Risks

❌ **DO NOT** deploy to production with hardcoded API keys  
❌ **DO NOT** commit this code to public repositories  
❌ **DO NOT** share the API key publicly

### Production Recommendations

#### 1. Environment Variables

Move the API key to environment variables:

```typescript
// watsonx-config.ts
export const WATSONX_CONFIG = {
  orchestrationID: "c139b03f7afb4bc7b617216e3046ac5b_6e4a398d-0f34-42ad-9706-1f16af156856",
  hostURL: "https://us-south.watson-orchestrate.cloud.ibm.com",
  deploymentPlatform: "ibmcloud" as const,
  crn: "crn:v1:bluemix:public:watsonx-orchestrate:us-south:a/c139b03f7afb4bc7b617216e3046ac5b:6e4a398d-0f34-42ad-9706-1f16af156856::",
  apiKey: import.meta.env.VITE_WATSONX_API_KEY || "",  // ✅ Use environment variable
  apiUrl: "https://api.us-south.watson-orchestrate.cloud.ibm.com/instances/6e4a398d-0f34-42ad-9706-1f16af156856"
};
```

Create `.env` file (add to `.gitignore`):
```bash
VITE_WATSONX_API_KEY=8JF8iB1bBVvzRtTvU1D8W7oeH8z0JqSMC9tF4KC4Ya6c
```

#### 2. Backend Proxy (Recommended)

Instead of exposing API keys in the frontend, create a backend service:

```
User → Your Backend API → IBM watsonx Orchestrate
```

**Benefits**:
- API key never exposed to client
- Rate limiting and monitoring
- Additional security layer
- Better error handling

#### 3. JWT Authentication

Enable full security using the provided script:

```bash
# Run the security configuration script
./wxO-embed-chat-security-tool.sh
```

This will:
1. Generate IBM key pair
2. Generate client key pair  
3. Enable JWT-based authentication
4. Eliminate anonymous access

See `/WATSONX_INTEGRATION.md` for the complete script.

#### 4. Rotate Keys Regularly

If this API key has been exposed:

1. Log into IBM Cloud Console
2. Navigate to watsonx Orchestrate instance
3. Go to Settings → API Details
4. Generate new service credentials
5. Update your configuration
6. Delete old credentials

### Current Security Configuration

```javascript
// Embedded webchat is currently using:
{
  deploymentPlatform: "ibmcloud",
  // Security is ENABLED by default but NOT CONFIGURED
  // This means anonymous access is allowed for development
}
```

### Next Steps for Production

- [ ] Move API key to environment variables
- [ ] Set up backend proxy service
- [ ] Run security configuration script
- [ ] Enable JWT authentication
- [ ] Implement rate limiting
- [ ] Add monitoring and logging
- [ ] Create key rotation schedule
- [ ] Review IBM Cloud security best practices

### Figma Make Environment Note

Since this is running in Figma Make's environment, the API key exposure is limited to the preview environment. However, if you plan to:

1. **Deploy externally** - Use environment variables or backend proxy
2. **Share the code** - Remove the API key first
3. **Make it public** - Implement full JWT security

### Resources

- [IBM Cloud API Key Best Practices](https://cloud.ibm.com/docs/account?topic=account-manapikey)
- [watsonx Orchestrate Security](https://www.ibm.com/docs/en/watsonx/watson-orchestrate)
- [Embedded Chat Security Guide](https://www.ibm.com/docs/en/watsonx/watson-orchestrate/base?topic=experience-using-agents-in-embedded-webchat)

### Contact

For security concerns or questions about this integration:
- Review IBM watsonx Orchestrate documentation
- Contact IBM Cloud support
- Consult your organization's security team

---

**Remember**: This integration is currently configured for **development and demonstration** purposes. Implement proper security measures before production deployment.

**Last Updated**: November 3, 2025  
**Security Level**: 🟡 Development (Anonymous Access)  
**Production Ready**: ❌ No - Security configuration required
