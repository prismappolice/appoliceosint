// Visitor Counter Script for factcheck.html compatibility
function loadFactcheckVisitorStats() {
  try {
    fetch('/api/visitor-stats')
      .then(response => response.json())
      .then(stats => {
        document.getElementById('total-visitors-factcheck').textContent = (typeof stats.totalVisitors === 'number' ? stats.totalVisitors : 0).toLocaleString();
        document.getElementById('unique-visitors-factcheck').textContent = (typeof stats.uniqueVisitors === 'number' ? stats.uniqueVisitors : 0).toLocaleString();
        document.getElementById('today-visitors-factcheck').textContent = (typeof stats.todayVisitors === 'number' ? stats.todayVisitors : 0).toLocaleString();
        document.getElementById('today-unique-factcheck').textContent = (typeof stats.todayUniqueVisitors === 'number' ? stats.todayUniqueVisitors : 0).toLocaleString();
      })
      .catch(() => {
        document.getElementById('total-visitors-factcheck').textContent = 'N/A';
        document.getElementById('unique-visitors-factcheck').textContent = 'N/A';
        document.getElementById('today-visitors-factcheck').textContent = 'N/A';
        document.getElementById('today-unique-factcheck').textContent = 'N/A';
      });
  } catch (error) {
    document.getElementById('total-visitors-factcheck').textContent = 'N/A';
    document.getElementById('unique-visitors-factcheck').textContent = 'N/A';
    document.getElementById('today-visitors-factcheck').textContent = 'N/A';
    document.getElementById('today-unique-factcheck').textContent = 'N/A';
  }
}

// Optionally, to auto-refresh for factcheck.html
function autoRefreshVisitorStats(pagePrefix) {
  if (pagePrefix === 'factcheck') {
    loadFactcheckVisitorStats();
    setInterval(loadFactcheckVisitorStats, 30000);
  } else {
    loadVisitorStats(pagePrefix);
    setInterval(() => loadVisitorStats(pagePrefix), 30000);
  }
}
// Visitor Counter Script for breach-data.html compatibility
function loadBreachVisitorStats() {
  try {
    fetch('/api/visitor-stats')
      .then(response => response.json())
      .then(stats => {
        document.getElementById('total-visitors-breach').textContent = (typeof stats.totalVisitors === 'number' ? stats.totalVisitors : 0).toLocaleString();
        document.getElementById('unique-visitors-breach').textContent = (typeof stats.uniqueVisitors === 'number' ? stats.uniqueVisitors : 0).toLocaleString();
        document.getElementById('today-visitors-breach').textContent = (typeof stats.todayVisitors === 'number' ? stats.todayVisitors : 0).toLocaleString();
        document.getElementById('today-unique-breach').textContent = (typeof stats.todayUniqueVisitors === 'number' ? stats.todayUniqueVisitors : 0).toLocaleString();
      })
      .catch(() => {
        document.getElementById('total-visitors-breach').textContent = 'N/A';
        document.getElementById('unique-visitors-breach').textContent = 'N/A';
        document.getElementById('today-visitors-breach').textContent = 'N/A';
        document.getElementById('today-unique-breach').textContent = 'N/A';
      });
  } catch (error) {
    document.getElementById('total-visitors-breach').textContent = 'N/A';
    document.getElementById('unique-visitors-breach').textContent = 'N/A';
    document.getElementById('today-visitors-breach').textContent = 'N/A';
    document.getElementById('today-unique-breach').textContent = 'N/A';
  }
}

// Optionally, to auto-refresh:
// loadBreachVisitorStats();
// setInterval(loadBreachVisitorStats, 30000);
// common.js
// Shared JavaScript for navigation, visitor stats, and UI logic

function openExternalLinksInNewTab() {
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href') ? link.getAttribute('href').toLowerCase() : '';
    // Do NOT open in new tab for internal navigation or tab links
    if (
      link.classList.contains('main-option-btn') ||
      link.closest('.navbar') || link.classList.contains('nav-link') ||
      href.includes('home.html') || href.includes('factcheck.html') ||
      href.includes('social-media.html') || href.includes('domain-intel.html') ||
      href.includes('breach-data.html') || href.includes('osinttools.html') ||
      href.includes('darkweb-tools.html') || href.includes('blockchain-tools.html') ||
      href.includes('learning.html') || href.includes('osint-books.html') || href.includes('index.html') ||
      href.includes('phone-intel.html') || href.includes('aitools.html') || href.includes('contact.html')
    ) {
      // Internal navigation, do not open in new tab
      link.setAttribute('target', '_self');
      return;
    }
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  });
}

function setActiveNavLink(section) {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });
  const targetLink = document.querySelector(`[data-section="${section}"]`);
  if (targetLink) {
    targetLink.classList.add('active');
    localStorage.setItem('activeNavSection', section);
  }
}


function setupDropdownMenu() {
  window.toggleDropdown = function (event) {
    event.stopPropagation();
    const dropdown = document.getElementById('dropdownMenu');
    if (dropdown) {
      const currentDisplay = dropdown.style.display;
      dropdown.style.display = currentDisplay === 'block' ? 'none' : 'block';
    }
  };
  document.addEventListener('click', function () {
    const dropdown = document.getElementById('dropdownMenu');
    if (dropdown) dropdown.style.display = 'none';
  });
}

function setupLogout() {
  window.logout = function () {
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = 'index.html';
  };
}

function loadVisitorStats(pagePrefix) {
  fetch('/api/visitor-stats')
    .then(response => response.json())
    .then(stats => {
      // If pagePrefix is empty, use base IDs (for index.html)
      const totalId = pagePrefix ? `total-visitors-${pagePrefix}` : 'total-visitors';
      const uniqueId = pagePrefix ? `unique-visitors-${pagePrefix}` : 'unique-visitors';
      const todayId = pagePrefix ? `today-visitors-${pagePrefix}` : 'today-visitors';
      const todayUniqueId = pagePrefix ? `today-unique-${pagePrefix}` : 'today-unique';
      document.getElementById(totalId).textContent = stats.totalVisitors?.toLocaleString() ?? '0';
      document.getElementById(uniqueId).textContent = stats.uniqueVisitors?.toLocaleString() ?? '0';
      document.getElementById(todayId).textContent = stats.todayVisitors?.toLocaleString() ?? '0';
      document.getElementById(todayUniqueId).textContent = stats.todayUniqueVisitors?.toLocaleString() ?? '0';
    })
    .catch(() => {
      const totalId = pagePrefix ? `total-visitors-${pagePrefix}` : 'total-visitors';
      const uniqueId = pagePrefix ? `unique-visitors-${pagePrefix}` : 'unique-visitors';
      const todayId = pagePrefix ? `today-visitors-${pagePrefix}` : 'today-visitors';
      const todayUniqueId = pagePrefix ? `today-unique-${pagePrefix}` : 'today-unique';
      document.getElementById(totalId).textContent = 'N/A';
      document.getElementById(uniqueId).textContent = 'N/A';
      document.getElementById(todayId).textContent = 'N/A';
      document.getElementById(todayUniqueId).textContent = 'N/A';
    });
}

function autoRefreshVisitorStats(pagePrefix) {
  loadVisitorStats(pagePrefix);
  setInterval(() => loadVisitorStats(pagePrefix), 30000);
}

window.addEventListener('DOMContentLoaded', function () {
  openExternalLinksInNewTab();
  // Force all tab links to open in same tab
  document.querySelectorAll('.main-option-btn').forEach(link => {
    link.setAttribute('target', '_self');
  });
  setupDropdownMenu();
  setupLogout();
  // Set active nav link from localStorage if available
  const storedSection = localStorage.getItem('activeNavSection');
  if (storedSection) setActiveNavLink(storedSection);
    const searched = localStorage.getItem('searchedTool');
    const searchedHeading = localStorage.getItem('searchedHeading');
    if (searched || searchedHeading) {
      // Remove previous highlights
      document.querySelectorAll('.search-highlight').forEach(el => {
        el.classList.remove('search-highlight');
      });
      // Normalize function for comparison
      const normalize = str => str.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      let found = false;
      // Scope search to main content area for uniqueness
      const mainContent = document.querySelector('.container-content') || document.body;
      // Highlight tool link if searched
      if (searched) {
        const toolLinks = mainContent.querySelectorAll('ol a, ul a, .tool-link, .tool-list a');
        toolLinks.forEach(el => {
          if (normalize(el.textContent) === normalize(searched) || (el.id && normalize(el.id).includes(normalize(searched)))) {
            el.classList.add('search-highlight');
            if (el.parentElement && el.parentElement.tagName === 'LI') {
              el.parentElement.classList.add('search-highlight');
            }
            if (!found) {
              setTimeout(() => {
                const headerOffset = 100;
                const y = el.getBoundingClientRect().top + window.scrollY - headerOffset;
                window.scrollTo({top: y, behavior: 'smooth'});
              }, 100);
              found = true;
            }
          }
        });
      }
      // Highlight heading if searchedHeading
      if (searchedHeading) {
        const headingEls = Array.from(mainContent.querySelectorAll('h2, h3, h4')).filter(el => {
          return normalize(el.textContent) === normalize(searchedHeading) ||
            (el.id && normalize(el.id) === normalize(searchedHeading));
        });
        headingEls.forEach(el => {
          el.classList.add('search-highlight');
          if (!found) {
            setTimeout(() => {
              const headerOffset = 100;
              const y = el.getBoundingClientRect().top + window.scrollY - headerOffset;
              window.scrollTo({top: y, behavior: 'smooth'});
            }, 100);
            found = true;
          }
        });
      }
      localStorage.removeItem('searchedTool');
      localStorage.removeItem('searchedHeading');
    }
});

// Sidebar toggle logic for hamburger and sidebar
function setupSidebarToggle(options) {
  // Accepts: { buttonId, sidebarId, backdropId }
  if (!options || !options.buttonId || !options.sidebarId || !options.backdropId) return;
  const hamburgerBtn = document.getElementById(options.buttonId);
  const sidebar = document.getElementById(options.sidebarId);
  const sidebarBackdrop = document.getElementById(options.backdropId);
  if (!hamburgerBtn || !sidebar || !sidebarBackdrop) return;
  const sidebarLinks = sidebar.querySelectorAll('a.nav-link');

  function openSidebar() {
    sidebar.classList.add('sidebar-open');
    sidebarBackdrop.classList.add('active');
    sidebar.setAttribute('aria-hidden', 'false');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
  }
  function closeSidebar() {
    sidebar.classList.remove('sidebar-open');
    sidebarBackdrop.classList.remove('active');
    sidebar.setAttribute('aria-hidden', 'true');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
  }
  function toggleSidebar() {
    if (sidebar.classList.contains('sidebar-open')) {
      closeSidebar();
    } else {
      openSidebar();
    }
  }
  hamburgerBtn.addEventListener('click', toggleSidebar);
  sidebarBackdrop.addEventListener('click', closeSidebar);
  sidebarLinks.forEach(link => {
    link.addEventListener('click', closeSidebar);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeSidebar();
  });
  // Close sidebar when clicking anywhere outside sidebar or hamburger
  document.addEventListener('mousedown', function (e) {
    if (
      sidebar.classList.contains('sidebar-open') &&
      !sidebar.contains(e.target) &&
      !hamburgerBtn.contains(e.target)
    ) {
      closeSidebar();
    }
  });
}

// ...existing code...

// Add search highlight styles
function addSearchHighlightStyles() {
  if (!document.getElementById('search-highlight-styles')) {
    const style = document.createElement('style');
    style.id = 'search-highlight-styles';
    style.textContent = `
      .search-highlight {
        background: linear-gradient(90deg, #fff3cd, #ffeaa7) !important;
        border: 2px solid #f39c12 !important;
        border-radius: 8px !important;
        padding: 8px !important;
        margin: 4px 0 !important;
        box-shadow: 0 4px 12px rgba(243, 156, 18, 0.3) !important;
        animation: searchPulse 2s ease-in-out !important;
        transition: all 0.3s ease !important;
      }
      
      @keyframes searchPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
      }
      
      .search-highlight:hover {
        background: linear-gradient(90deg, #f39c12, #e67e22) !important;
        color: white !important;
      }
    `;
    document.head.appendChild(style);
  }
}

// Search bar logic: redirect to tool page by name
window.addEventListener('DOMContentLoaded', function () {
  addSearchHighlightStyles();
  
  const searchBar = document.getElementById('searchBar');
  const searchBtn = document.getElementById('searchBtn');
  if (!searchBar || !searchBtn) return;
  // Add live search results container
  let resultsContainer = document.getElementById('searchResultsDropdown');
  if (!resultsContainer) {
    resultsContainer = document.createElement('div');
    resultsContainer.id = 'searchResultsDropdown';
    resultsContainer.style.position = 'absolute';
    resultsContainer.style.top = '100%';
    resultsContainer.style.left = '0';
    resultsContainer.style.width = '100%';
  resultsContainer.style.background = '#fff';
  resultsContainer.style.color = '#222';
    resultsContainer.style.border = '1px solid #ccc';
    resultsContainer.style.zIndex = '9999';
    resultsContainer.style.maxHeight = '300px';
    resultsContainer.style.overflowY = 'auto';
    resultsContainer.style.display = 'none';
    resultsContainer.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    searchBar.parentElement.appendChild(resultsContainer);
  }
  // Dynamic search system - builds comprehensive tool database from all pages
  const allPages = [
    'osinttools.html', 'social-media.html', 'domain-intel.html', 'breach-data.html', 
    'darkweb-tools.html', 'blockchain-tools.html', 'phone-intel.html', 'factcheck.html', 
    'aitools.html', 'learning.html', 'osint-books.html', 'contact.html', 'github.html', 'home.html',
    'index.html', 'financialfraudosint.html', 'mobile-test.html', 'cyber.html'
  ];

  // Comprehensive tool mapping including all tools from your screenshot
  const toolPages = {
    // Main categories and pages
    'home': {page: 'home.html', heading: 'WELCOME TO OSINT WEBSITE'},
    'osint tools': {page: 'osinttools.html', heading: 'OPEN SOURCE INTELLIGENCE (OSINT) TOOLS'},
    'ai tools': {page: 'aitools.html', heading: 'AI TOOLS'},
    'fact check tools': {page: 'factcheck.html', heading: 'FACT CHECK TOOLS'},
    'dark web tools': {page: 'darkweb-tools.html', heading: 'DARK WEB TOOLS'},
    'darkweb tools': {page: 'darkweb-tools.html', heading: 'DARK WEB TOOLS'},
    'blockchain tools': {page: 'blockchain-tools.html', heading: 'BLOCKCHAIN TOOLS'},
    'social media tools': {page: 'social-media.html', heading: 'SOCIAL MEDIA TOOLS'},
    'domain intel tools': {page: 'domain-intel.html', heading: 'DOMAIN INTEL TOOLS'},
    'breach data tools': {page: 'breach-data.html', heading: 'BREACH DATA TOOLS'},
    'phone intel tools': {page: 'phone-intel.html', heading: 'PHONE INTEL TOOLS'},
    'learning': {page: 'learning.html', heading: 'LEARNING RESOURCES'},
    'cyber security': {page: 'cyber.html', heading: 'CYBER SECURITY RESOURCES'},
    'cybersecurity': {page: 'cyber.html', heading: 'CYBER SECURITY RESOURCES'},
    'cyber': {page: 'cyber.html', heading: 'CYBER SECURITY RESOURCES'},
    'contact': {page: 'contact.html', heading: 'CONTACT US'},
    'github': {page: 'github.html', heading: 'GITHUB'},

    // OSINT Tools - Bucket Search
    'osint.sh': {page: 'osinttools.html', heading: 'Osint.Sh'},
    'bucket search': {page: 'osinttools.html', heading: '1. BUCKET SEARCH'},

    // OSINT Tools - Web OSINT
    'web.check.xyz': {page: 'osinttools.html', heading: 'Web.Check.Xyz'},
    'scrapegraphai': {page: 'osinttools.html', heading: 'Scrapegraphai'},
    'tracefind.info': {page: 'osinttools.html', heading: 'Tracefind.Info'},
    'gitsearch.ai': {page: 'osinttools.html', heading: 'Gitsearch.ai'},
    'cyber.url.scanner': {page: 'osinttools.html', heading: 'Cyber.Url.Scanner'},
    'website.informer': {page: 'osinttools.html', heading: 'Website.Informer'},
    'osint.portal': {page: 'osinttools.html', heading: 'Osint.Portal'},
    'deepfind.me': {page: 'osinttools.html', heading: 'Deepfind.Me'},
    'talkwalker': {page: 'osinttools.html', heading: 'Talkwalker'},
    'maltego.com': {page: 'osinttools.html', heading: 'Maltego.Com'},
    'shodan.io': {page: 'osinttools.html', heading: 'Shodan.Io'},
    'securitytrails': {page: 'osinttools.html', heading: 'Securitytrails'},
    'web osint': {page: 'osinttools.html', heading: '2. WEB OSINT'},

    // OSINT Tools - Crawling & Scraping  
    'crawling-scraping': {page: 'osinttools.html', heading: '3. CRAWLING-SCRAPING'},
    'crawling scraping': {page: 'osinttools.html', heading: '3. CRAWLING-SCRAPING'},

    // OSINT Tools - Email Intelligence
    'email intelligence': {page: 'osinttools.html', heading: '4. EMAIL INTELLIGENCE'},

    // OSINT Tools - General OSINT
    'general osint': {page: 'osinttools.html', heading: '5. GENERAL OSINT'},

    // OSINT Tools - Best OSINT Tools
    'best osint tools': {page: 'osinttools.html', heading: '6. BEST OSINT TOOLS'},

    // AI Tools
    'chatgpt': {page: 'aitools.html', heading: 'ChatGPT'},
    'claude': {page: 'aitools.html', heading: 'Claude'},
    'gemini': {page: 'aitools.html', heading: 'Gemini'},
    'copilot': {page: 'aitools.html', heading: 'Copilot'},

    // Fact Check Tools
    'fact checking websites': {page: 'factcheck.html', heading: '1. FACT-CHECKING WEBSITES'},
    'ai detection tools': {page: 'factcheck.html', heading: '2. AI DETECTION TOOLS'},
    'image forensics tools': {page: 'factcheck.html', heading: '3. IMAGE FORENSICS TOOLS'},

    // Social Media Tools  
    'facebook tools': {page: 'social-media.html', heading: '1. FACEBOOK TOOLS'},
    'twitter tools': {page: 'social-media.html', heading: '2. TWITTER TOOLS'},
    'instagram tools': {page: 'social-media.html', heading: '3. INSTAGRAM TOOLS'},
    'linkedin tools': {page: 'social-media.html', heading: '4. LINKEDIN TOOLS'},
    'youtube tools': {page: 'social-media.html', heading: '5. YOUTUBE TOOLS'},
    'telegram tools': {page: 'social-media.html', heading: '6. TELEGRAM TOOLS'},
    'tiktok tools': {page: 'social-media.html', heading: '7. TIKTOK TOOLS'},
    'whatsapp tools': {page: 'social-media.html', heading: '8. WHATSAPP TOOLS'},
    'username search tools': {page: 'social-media.html', heading: '9. USERNAME SEARCH TOOLS'},

    // Domain Intel Tools
    'whois lookup': {page: 'domain-intel.html', heading: '1. WHOIS LOOKUP'},
    'dns analysis': {page: 'domain-intel.html', heading: '2. DNS ANALYSIS'},
    'subdomain discovery': {page: 'domain-intel.html', heading: '3. SUBDOMAIN DISCOVERY'},
    'website analysis': {page: 'domain-intel.html', heading: '4. WEBSITE ANALYSIS'},
    'ssl certificate analysis': {page: 'domain-intel.html', heading: '5. SSL CERTIFICATE ANALYSIS'},
    'ip geolocation': {page: 'domain-intel.html', heading: '6. IP GEOLOCATION'},
    'website history': {page: 'domain-intel.html', heading: '7. WEBSITE HISTORY'},
    'domain monitoring': {page: 'domain-intel.html', heading: '8. DOMAIN MONITORING'},

    // Breach Data Tools
    'osintleak.com': {page: 'breach-data.html', heading: 'Osintleak.Com'},
    'osintleak': {page: 'breach-data.html', heading: 'Osintleak.Com'},
    'haveibeenpwned': {page: 'breach-data.html', heading: 'Haveibeenpwned'},
    'breach.directory': {page: 'breach-data.html', heading: 'Breach.Directory'},
    'dehashed': {page: 'breach-data.html', heading: 'Dehashed'},
    'leakcheck': {page: 'breach-data.html', heading: 'Leakcheck'},
    'credential breach databases': {page: 'breach-data.html', heading: '1. CREDENTIAL BREACH DATABASES'},
    'hash cracking tools': {page: 'breach-data.html', heading: '2. HASH CRACKING TOOLS'},
    'data leak monitoring': {page: 'breach-data.html', heading: '3. DATA LEAK MONITORING'},
    'ransomware tracking': {page: 'breach-data.html', heading: '4. RANSOMWARE TRACKING'},
    'cryptocurrency investigations': {page: 'breach-data.html', heading: '5. CRYPTOCURRENCY INVESTIGATIONS'},
    'malware analysis': {page: 'breach-data.html', heading: '6. MALWARE ANALYSIS'},
    'threat intelligence': {page: 'breach-data.html', heading: '7. THREAT INTELLIGENCE'},
    'dark web monitoring': {page: 'breach-data.html', heading: '8. DARK WEB MONITORING'},
    'cybersecurity databases': {page: 'breach-data.html', heading: '9. CYBERSECURITY DATABASES'},
    'digital forensics': {page: 'breach-data.html', heading: '10. DIGITAL FORENSICS'},

    // Dark Web Tools
    'tor browser': {page: 'darkweb-tools.html', heading: '1. ACCESS THE DARK WEB SECURELY'},
    'dark web search engines': {page: 'darkweb-tools.html', heading: '2. DARK WEB SEARCH ENGINES'},
    'breach data intelligence': {page: 'darkweb-tools.html', heading: '3. BREACH DATA & INTELLIGENCE'},
    'telegram intelligence tools': {page: 'darkweb-tools.html', heading: '4. TELEGRAM INTELLIGENCE TOOLS'},
    'cryptocurrency tracking': {page: 'darkweb-tools.html', heading: '5. CRYPTOCURRENCY TRACKING'},
    'threat intelligence platforms': {page: 'darkweb-tools.html', heading: '6. THREAT INTELLIGENCE PLATFORMS'},

    // Blockchain Tools
    'blockchain explorers': {page: 'blockchain-tools.html', heading: '1. BLOCKCHAIN EXPLORERS'},
    'multi-chain explorers': {page: 'blockchain-tools.html', heading: '2. MULTI-CHAIN EXPLORERS'},
    'ethereum ecosystem': {page: 'blockchain-tools.html', heading: '3. ETHEREUM ECOSYSTEM'},
    'layer 2 solutions': {page: 'blockchain-tools.html', heading: '4. LAYER 2 SOLUTIONS'},
    'alternative blockchains': {page: 'blockchain-tools.html', heading: '5. ALTERNATIVE BLOCKCHAINS'},
    'defi analytics': {page: 'blockchain-tools.html', heading: '6. DEFI ANALYTICS'},
    'address clustering': {page: 'blockchain-tools.html', heading: '7. ADDRESS CLUSTERING & INVESTIGATION'},
    'professional investigation tools': {page: 'blockchain-tools.html', heading: '8. PROFESSIONAL INVESTIGATION TOOLS'},

    // Phone Intel Tools
    'phone number validation': {page: 'phone-intel.html', heading: '1. PHONE NUMBER VALIDATION'},
    'reverse phone lookup': {page: 'phone-intel.html', heading: '2. REVERSE PHONE LOOKUP'},
    'social media phone search': {page: 'phone-intel.html', heading: '3. SOCIAL MEDIA PHONE SEARCH'},

    // Learning Resources
    'osint training videos': {page: 'learning.html', heading: '1. OSINT TRAINING VIDEOS'},
    'osint books': {page: 'osint-books.html', heading: 'OSINT BOOKS COLLECTION'},

    // Popular tools and shortcuts
    'shodan': {page: 'osinttools.html', heading: 'Shodan.Io'},
    'maltego': {page: 'osinttools.html', heading: 'Maltego.Com'},
    'virustotal': {page: 'breach-data.html', heading: 'Virustotal'},
    'blockchain': {page: 'blockchain-tools.html', heading: 'BLOCKCHAIN TOOLS'},
    'osint': {page: 'osinttools.html', heading: 'OPEN SOURCE INTELLIGENCE (OSINT) TOOLS'},
    'leak': {page: 'breach-data.html', heading: 'Osintleak.Com'},
    'darkweb': {page: 'darkweb-tools.html', heading: 'DARK WEB TOOLS'},
    'social': {page: 'social-media.html', heading: 'SOCIAL MEDIA TOOLS'},
    'domain': {page: 'domain-intel.html', heading: 'DOMAIN INTEL TOOLS'},
    'phone': {page: 'phone-intel.html', heading: 'PHONE INTEL TOOLS'},
    'ai': {page: 'aitools.html', heading: 'AI TOOLS'},
    'fact': {page: 'factcheck.html', heading: 'FACT CHECK TOOLS'},
    'breach': {page: 'breach-data.html', heading: 'BREACH DATA TOOLS'},

    // Cyber Security Tools
    'nmap': {page: 'cyber.html', heading: 'Nmap (Network Mapper)'},
    'wireshark': {page: 'cyber.html', heading: 'Wireshark'},
    'metasploit': {page: 'cyber.html', heading: 'Metasploit Framework'},
    'burp suite': {page: 'cyber.html', heading: 'Burp Suite'},
    'owasp zap': {page: 'cyber.html', heading: 'OWASP ZAP'},
    'sqlmap': {page: 'cyber.html', heading: 'SQLMap'},
    'aircrack-ng': {page: 'cyber.html', heading: 'Aircrack-ng'},
    'hashcat': {page: 'cyber.html', heading: 'Hashcat'},
    'john ripper': {page: 'cyber.html', heading: 'John the Ripper'},
    'john the ripper': {page: 'cyber.html', heading: 'John the Ripper'},
    'nikto': {page: 'cyber.html', heading: 'Nikto'},
    'autopsy': {page: 'cyber.html', heading: 'Autopsy'},
    'volatility': {page: 'cyber.html', heading: 'Volatility'},
    'sleuth kit': {page: 'cyber.html', heading: 'The Sleuth Kit'},
    'ftk imager': {page: 'cyber.html', heading: 'FTK Imager'},
    'yara': {page: 'cyber.html', heading: 'YARA'},
    'osquery': {page: 'cyber.html', heading: 'OSQuery'},
    'graylog': {page: 'cyber.html', heading: 'Graylog'},
    'splunk': {page: 'cyber.html', heading: 'Splunk'},
    'misp': {page: 'cyber.html', heading: 'MISP'},
    'opencti': {page: 'cyber.html', heading: 'OpenCTI'},
    'thehive': {page: 'cyber.html', heading: 'TheHive'},
    'cortex': {page: 'cyber.html', heading: 'Cortex'},
    'elastic security': {page: 'cyber.html', heading: 'Elastic Security'},
    'wazuh': {page: 'cyber.html', heading: 'Wazuh'},
    'nessus': {page: 'cyber.html', heading: 'Nessus'},
    'openvas': {page: 'cyber.html', heading: 'OpenVAS'},
    'nuclei': {page: 'cyber.html', heading: 'Nuclei'},
    'lynis': {page: 'cyber.html', heading: 'Lynis'},
    'qualys': {page: 'cyber.html', heading: 'Qualys'},
    'suricata': {page: 'cyber.html', heading: 'Suricata'},
    'snort': {page: 'cyber.html', heading: 'Snort'},
    'zeek': {page: 'cyber.html', heading: 'Zeek'},
    'ntopng': {page: 'cyber.html', heading: 'ntopng'},
    'tcpdump': {page: 'cyber.html', heading: 'tcpdump'},
    'cuckoo sandbox': {page: 'cyber.html', heading: 'Cuckoo Sandbox'},
    'remnux': {page: 'cyber.html', heading: 'REMnux'},
    'flare vm': {page: 'cyber.html', heading: 'FLARE VM'},
    'radare2': {page: 'cyber.html', heading: 'Radare2'},
    'ghidra': {page: 'cyber.html', heading: 'Ghidra'},
    'ida pro': {page: 'cyber.html', heading: 'IDA Pro'},
    'cybrary': {page: 'cyber.html', heading: 'Cybrary'},
    'sans training': {page: 'cyber.html', heading: 'SANS Training'},
    'tryhackme': {page: 'cyber.html', heading: 'TryHackMe'},
    'hackthebox': {page: 'cyber.html', heading: 'Hack The Box'},
    'hack the box': {page: 'cyber.html', heading: 'Hack The Box'},
    'nist framework': {page: 'cyber.html', heading: 'NIST Cybersecurity Framework'},
    'iso 27001': {page: 'cyber.html', heading: 'ISO 27001'},
    'cis controls': {page: 'cyber.html', heading: 'CIS Controls'},
    'mitre attack': {page: 'cyber.html', heading: 'MITRE ATT&CK'},
    'owasp top 10': {page: 'cyber.html', heading: 'OWASP Top 10'},
    'owasp top10': {page: 'cyber.html', heading: 'OWASP Top 10'},

    // Cyber Security Categories
    'cyber security tools': {page: 'cyber.html', heading: '🛡️ CYBER SECURITY TOOLS'},
    'incident response': {page: 'cyber.html', heading: '🚨 INCIDENT RESPONSE TOOLS'},
    'threat hunting': {page: 'cyber.html', heading: '🔍 THREAT HUNTING PLATFORMS'},
    'vulnerability assessment': {page: 'cyber.html', heading: '🔐 VULNERABILITY ASSESSMENT'},
    'network security': {page: 'cyber.html', heading: '🌐 NETWORK SECURITY MONITORING'},
    'malware analysis': {page: 'cyber.html', heading: '🦠 MALWARE ANALYSIS'},
    'cyber training': {page: 'cyber.html', heading: '🎓 CYBER SECURITY TRAINING RESOURCES'},
    'compliance frameworks': {page: 'cyber.html', heading: '📋 COMPLIANCE & FRAMEWORKS'},
    'cyber intelligence': {page: 'cyber.html', heading: '🧠 CYBER THREAT INTELLIGENCE'},
  };
  function searchTool() {
    const query = searchBar.value.trim().toLowerCase();
    if (!query || query.length < 1) {
      resultsContainer.style.display = 'none';
      resultsContainer.innerHTML = '';
      return;
    }
    
    let matches = [];
    const normalizeText = (text) => text.toLowerCase().replace(/[^a-z0-9]/g, '');
    const queryNorm = normalizeText(query);
    
    // Enhanced search logic with fuzzy matching
    for (const [name, obj] of Object.entries(toolPages)) {
      const nameNorm = normalizeText(name);
      const headingNorm = normalizeText(obj.heading || '');
      
      // Exact matches get highest priority
      if (nameNorm === queryNorm || headingNorm === queryNorm) {
        matches.push({name, obj, score: 100});
      }
      // Starts with query gets high priority
      else if (nameNorm.startsWith(queryNorm) || headingNorm.startsWith(queryNorm)) {
        matches.push({name, obj, score: 90});
      }
      // Contains query gets medium priority
      else if (nameNorm.includes(queryNorm) || headingNorm.includes(queryNorm)) {
        matches.push({name, obj, score: 70});
      }
      // Word boundary matches get lower priority
      else if (name.toLowerCase().includes(query) || (obj.heading && obj.heading.toLowerCase().includes(query))) {
        matches.push({name, obj, score: 50});
      }
    }
    
    // Sort by score (highest first), then alphabetically
    matches.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.name.localeCompare(b.name);
    });
    
    // Remove duplicates by name + heading, keeping highest score
    const seen = new Set();
    matches = matches.filter(item => {
      const key = item.name + '|' + (item.obj.heading || '');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    
    // Paginate results (8 per page for better mobile display)
    const pageSize = 8;
    let pageNum = 1;
    let totalPages = Math.ceil(matches.length / pageSize);
    function renderResults(pageNum) {
      resultsContainer.innerHTML = '';
      if (matches.length === 0) {
        resultsContainer.style.display = 'none';
        return;
      }
      resultsContainer.style.display = 'block';
      const start = (pageNum - 1) * pageSize;
      const end = Math.min(start + pageSize, matches.length);
      for (let i = start; i < end; i++) {
        const item = matches[i];
        const div = document.createElement('div');
        
        // Create rich display with tool name and page info
        const toolName = item.name.charAt(0).toUpperCase() + item.name.slice(1);
        const pageName = item.obj.page.replace('.html', '').replace('-', ' ');
        
        div.innerHTML = `
          <div style="font-weight: 600; color: #1565c0;">${toolName}</div>
          <div style="font-size: 11px; color: #666; margin-top: 2px;">in ${pageName}</div>
        `;
        
        div.style.padding = '10px 12px';
        div.style.cursor = 'pointer';
        div.style.borderBottom = '1px solid #eee';
        div.style.color = '#222';
        div.style.transition = 'all 0.2s ease';
        
        div.addEventListener('mouseenter', function() {
          div.style.background = '#e3f2fd';
          div.style.transform = 'translateX(4px)';
        });
        div.addEventListener('mouseleave', function() {
          div.style.background = '#fff';
          div.style.transform = 'translateX(0)';
        });
        
        div.addEventListener('click', function() {
          resultsContainer.style.display = 'none';
          searchBar.value = '';
          
          // Store search info for highlighting
          localStorage.setItem('searchedTool', item.name);
          localStorage.setItem('searchedHeading', item.obj.heading);
          
          const currentPage = window.location.pathname.split('/').pop();
          if (item.obj.page !== currentPage) {
            // Navigate to different page
            window.location.href = item.obj.page;
          } else {
            // Same page - scroll to element
            scrollToSearchResult(item);
          }
        });
        resultsContainer.appendChild(div);
      }
      // Pagination controls
      if (totalPages > 1) {
        const pagDiv = document.createElement('div');
        pagDiv.style.textAlign = 'center';
        pagDiv.style.padding = '6px';
        pagDiv.style.background = '#f9f9f9';
        pagDiv.innerHTML = `<button id="prevPageBtn" ${pageNum===1?'disabled':''}>Prev</button> <span>Page ${pageNum}/${totalPages}</span> <button id="nextPageBtn" ${pageNum===totalPages?'disabled':''}>Next</button>`;
        resultsContainer.appendChild(pagDiv);
        pagDiv.querySelector('#prevPageBtn').onclick = function(e){e.stopPropagation();if(pageNum>1){pageNum--;renderResults(pageNum);}};
        pagDiv.querySelector('#nextPageBtn').onclick = function(e){e.stopPropagation();if(pageNum<totalPages){pageNum++;renderResults(pageNum);}};
      }
    }
    if (matches.length === 0) {
      resultsContainer.innerHTML = '';
      resultsContainer.style.display = 'block';
      const noMatchDiv = document.createElement('div');
      noMatchDiv.innerHTML = `
        <div style="text-align: center; padding: 16px; color: #666;">
          <div style="font-size: 14px; margin-bottom: 4px;">🔍 No matches found</div>
          <div style="font-size: 11px;">Try searching for tool names, categories, or pages</div>
        </div>
      `;
      resultsContainer.appendChild(noMatchDiv);
      return;
    }
    renderResults(pageNum);
  }
  
  // Helper function to scroll to search result on same page
  function scrollToSearchResult(item) {
    const mainContent = document.querySelector('.container-content') || document.body;
    const normalize = str => str.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Remove previous highlights
    document.querySelectorAll('.search-highlight').forEach(el => {
      el.classList.remove('search-highlight');
    });
    
    let targetEl = null;
    
    // Try to find by heading text
    const headingEls = Array.from(mainContent.querySelectorAll('h2, h3, h4')).filter(el => {
      return normalize(el.textContent) === normalize(item.obj.heading) ||
             normalize(el.textContent) === normalize(item.name);
    });
    if (headingEls.length > 0) targetEl = headingEls[0];
    
    // Try to find by tool link text
    if (!targetEl) {
      const toolLinks = Array.from(mainContent.querySelectorAll('ol a, ul a, .tool-link, .tool-list a')).filter(el => {
        return normalize(el.textContent) === normalize(item.obj.heading) ||
               normalize(el.textContent) === normalize(item.name) ||
               (el.id && normalize(el.id).includes(normalize(item.name)));
      });
      if (toolLinks.length > 0) targetEl = toolLinks[0];
    }
    
    // Try to find by ID
    if (!targetEl && item.obj.heading) {
      const possibleId = item.obj.heading.toLowerCase().replace(/[^a-z0-9]/g, '-');
      targetEl = document.getElementById(possibleId) || document.getElementById('tool-' + possibleId);
    }
    
    if (targetEl) {
      targetEl.classList.add('search-highlight');
      if (targetEl.parentElement && targetEl.parentElement.tagName === 'LI') {
        targetEl.parentElement.classList.add('search-highlight');
      }
      setTimeout(() => {
        const headerOffset = 120;
        const y = targetEl.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({top: y, behavior: 'smooth'});
      }, 100);
    }
  }
  // Event listeners for search
  searchBtn.addEventListener('click', function(e) {
    e.preventDefault();
    if (searchBar.value.trim()) {
      searchTool();
      if (resultsContainer.children.length > 0) {
        resultsContainer.children[0].click(); // Click first result
      }
    }
  });
  
  searchBar.addEventListener('input', searchTool);
  
  searchBar.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (resultsContainer.children.length > 0) {
        const firstResult = resultsContainer.querySelector('div[style*="cursor: pointer"]');
        if (firstResult) firstResult.click();
      }
    } else if (e.key === 'Escape') {
      resultsContainer.style.display = 'none';
      searchBar.blur();
    }
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', function(e) {
    if (!searchBar.contains(e.target) && !resultsContainer.contains(e.target)) {
      resultsContainer.style.display = 'none';
    }
  });
  
  // Show/hide dropdown on focus/blur
  searchBar.addEventListener('focus', function() {
    if (searchBar.value.trim() && resultsContainer.innerHTML) {
      resultsContainer.style.display = 'block';
    }
  });
});

// Highlight searched tool/category/heading after redirect
window.addEventListener('DOMContentLoaded', function () {
  const searched = localStorage.getItem('searchedTool');
  const searchedHeading = localStorage.getItem('searchedHeading');
  if (searched) {
    // Remove previous highlights
    document.querySelectorAll('.search-highlight').forEach(el => {
      el.classList.remove('search-highlight');
    });
    let found = false;
    // Improved highlight: normalize and match tool links by text or id
    const normalize = str => str.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const normSearched = normalize(searched);
    const toolLinks = document.querySelectorAll('ol a, ul a, .tool-link, .tool-list a');
    toolLinks.forEach(el => {
      const normText = normalize(el.textContent);
      const normId = el.id ? normalize(el.id) : '';
      if (normText === normSearched || normId === normSearched) {
        el.classList.add('search-highlight');
        if (el.parentElement && el.parentElement.tagName === 'LI') {
          el.parentElement.classList.add('search-highlight');
        }
        setTimeout(() => {
          const y = el.getBoundingClientRect().top + window.scrollY - 30;
          window.scrollTo({top: y, behavior: 'smooth'});
        }, 100);
        found = true;
      }
    });
    localStorage.removeItem('searchedTool');
  }
});
