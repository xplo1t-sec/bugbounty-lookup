let chaosData;

fetch('public/chaos-bugbounty-list.json')
    .then(response => response.json())
    .then(data => {
        chaosData = data;
    })
    .catch(error => {
        console.error('Failed to load chaos data:', error);
    });

function escapeHTML(str) {
    return str.replace(/[&<>"']/g, function (match) {
        const escape = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return escape[match];
    });
}

const getApexDomain = (input) => {
    let hostname;

    try {
        const parsedUrl = new URL(input);
        hostname = parsedUrl.hostname;
    } catch (e) {
        hostname = input;
    }

    const parts = hostname.split('.').slice(-2);
    return parts.join('.');
};

const checkDomainInBountyList = (domain) => {
    const apexDomain = getApexDomain(domain);

    if (!apexDomain) {
        return { error: 'Invalid domain or URL' };
    }

    for (let program of chaosData.programs) {
        if (program.domains && program.domains.includes(apexDomain)) {
            return { program_name: program.name, program_url: program.url };
        }
    }

    return null;
};


const checkDomain = () => {
    const domain = document.getElementById('domainInput').value.toLowerCase();
    const resultMessage = document.getElementById('resultMessage');
    const spinner = document.getElementById('spinner');

    resultMessage.style.display = 'none';
    spinner.style.display = 'block';

    if (!domain) {
        spinner.style.display = 'none';
        resultMessage.textContent = 'Please enter a valid domain or URL.';
        resultMessage.className = 'message error';
        resultMessage.style.display = 'block';
        return;
    }

    setTimeout(() => {
        const data = checkDomainInBountyList(domain);

        spinner.style.display = 'none';

        if (data && data.program_name) {
            const programName = escapeHTML(data.program_name);
            const programUrl = escapeHTML(data.program_url);
            resultMessage.innerHTML = `🎯 Found: <strong>${programName}</strong><br>
                <a href="${programUrl}" target="_blank">Visit Program Page</a>`;
            resultMessage.className = 'message success';
        } else if (data && data.error) {
            resultMessage.textContent = data.error;
            resultMessage.className = 'message error';
        } else {
            resultMessage.textContent = 'Sorry, no bug bounty / VDP program found for this domain.';
            resultMessage.className = 'message error';
        }

        resultMessage.style.display = 'block';
    }, 500);
};


const handleEnter = (event) => {
    if (event.key === 'Enter') {
        checkDomain();
    }
};
