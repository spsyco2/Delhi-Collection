const fs = require('fs');
let code = fs.readFileSync('src/components/campaign/CustomerCampaignView.tsx', 'utf8');

code = code.replace(
  /const \[customerName, setCustomerName\] = useState(?:<string>)?\('.*?'\);/,
  "const [customerName, setCustomerName] = useState<string>(localStorage.getItem('dc_customer_name') || '');"
);

code = code.replace(
  /const \[phoneNumber, setPhoneNumber\] = useState(?:<string>)?\('.*?'\);/,
  "const [phoneNumber, setPhoneNumber] = useState<string>(localStorage.getItem('dc_customer_phone') || '');"
);

code = code.replace(
  /const \[isVerified, setIsVerified\] = useState(?:<boolean>)?\(false\);/,
  "const [isVerified, setIsVerified] = useState<boolean>(!!localStorage.getItem('dc_customer_phone'));"
);

// We need to also fetch eligibility immediately if isVerified is true initially, otherwise they might not be able to spin.
// Or we can just run handleVerifyIdentity inside a useEffect.
// Actually let's just make it auto-verify on mount if they have local storage.

const useEffectCode = `
  useEffect(() => {
    if (localStorage.getItem('dc_customer_phone') && localStorage.getItem('dc_customer_name')) {
      const result = campaignStore.checkEligibility(campaign.id, localStorage.getItem('dc_customer_phone')!, localStorage.getItem('dc_customer_name')!);
      setEligibility(result);
    }
  }, [campaign.id]);
`;

if (!code.includes('checkEligibility(campaign.id, localStorage')) {
  code = code.replace(/const handleVerifyIdentity =/, useEffectCode + '\n  const handleVerifyIdentity =');
}

fs.writeFileSync('src/components/campaign/CustomerCampaignView.tsx', code);
