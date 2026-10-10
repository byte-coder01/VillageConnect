(() => {
  'use strict';

  const STORAGE_KEY = 'villageconnect-language';
  const normalize = value => String(value ?? '').replace(/\s+/g, ' ').trim();
  const hindi = new Map(Object.entries({
    // Shared navigation, controls and footer
    'Skip to content': 'मुख्य सामग्री पर जाएँ',
    'The interactive map is not loaded yet. Load it only when you need the embedded preview.': 'इंटरैक्टिव मानचित्र अभी लोड नहीं है। एम्बेडेड पूर्वावलोकन की आवश्यकता होने पर ही इसे लोड करें।',
    'Google Maps may set third-party cookies when loaded. Your choice to allow embedded maps is remembered in this browser. You can also open Google Maps in a new tab.': 'लोड होने पर Google Maps तृतीय-पक्ष कुकीज़ सेट कर सकता है। एम्बेडेड मानचित्रों की अनुमति देने का आपका विकल्प इस ब्राउज़र में याद रखा जाएगा। आप Google Maps को नए टैब में भी खोल सकते हैं।',
    'Load interactive map': 'इंटरैक्टिव मानचित्र लोड करें',
    'Interactive map privacy controls': 'इंटरैक्टिव मानचित्र की गोपनीयता नियंत्रण',
    'Home': 'होम', 'Services': 'सेवाएँ', 'Discover': 'खोजें', 'Updates': 'अपडेट', 'Contact': 'संपर्क', 'Settings': 'सेटिंग्स',
    'Open menu': 'मेनू खोलें', 'Close menu': 'मेनू बंद करें', 'Main navigation': 'मुख्य नेविगेशन',
    'Switch to night mode': 'रात्रि मोड चालू करें', 'Switch to day mode': 'दिन मोड चालू करें', 'Open settings': 'सेटिंग्स खोलें',
    'VillageConnect home': 'VillageConnect होम',
    'Illustration of a connected village with local services': 'स्थानीय सेवाओं वाले जुड़े हुए गाँव का चित्र',
    'Quick links': 'त्वरित लिंक',
    'Google Maps overview near Pauri Garhwal': 'पौड़ी गढ़वाल के आसपास Google Maps का दृश्य', 'Google Maps overview for your saved area': 'आपके सहेजे गए इलाके का Google Maps दृश्य',
    'Google Maps showing public events and services near the selected location': 'चुने गए स्थान के आसपास सार्वजनिक कार्यक्रम और सेवाएँ दिखाता Google Maps',
    'Google Map near Pauri Garhwal, Uttarakhand': 'पौड़ी गढ़वाल, उत्तराखंड के आसपास Google मानचित्र', 'Google Map centered on your saved area': 'आपके सहेजे गए इलाके पर केंद्रित Google मानचित्र',
    'Village home': 'गाँव का मुख्य पृष्ठ', 'Get started': 'शुरू करें', 'Share an update': 'अपडेट साझा करें',
    'Open map': 'मानचित्र खोलें', 'All services': 'सभी सेवाएँ', 'Discover places': 'स्थान खोजें', 'Map': 'मानचित्र',
    'Contact VillageConnect ↗': 'VillageConnect से संपर्क करें ↗', '© 2026 VillageConnect': '© 2026 VillageConnect',
    'Service guide': 'सेवा मार्गदर्शिका', 'ESSENTIAL SERVICES': 'आवश्यक सेवाएँ', 'EDUCATION & JOBS': 'शिक्षा और रोज़गार', 'SAFETY': 'सुरक्षा',
    'A more connected village starts here.': 'एक अधिक जुड़ा हुआ गाँव यहीं से शुरू होता है।',
    'Independent community information portal · Verify important details locally.': 'स्वतंत्र सामुदायिक सूचना पोर्टल · महत्वपूर्ण जानकारी की स्थानीय स्तर पर पुष्टि करें।',
    'VillageConnect has one home page now.': 'VillageConnect का अब एक ही होम पेज है।',
    'Continue to the VillageConnect home page': 'VillageConnect के होम पेज पर जाएँ',

    // Home page
    'VillageConnect — Your village, within reach': 'VillageConnect — आपका गाँव, अब आपके करीब',
    'A SMARTER WAY TO BELONG': 'जुड़ाव का एक बेहतर तरीका', 'Your village,': 'आपका गाँव,', 'within reach.': 'अब आपके करीब।',
    'One digital doorstep for the everyday things that matter — services, local places, community updates and the people around you.': 'रोज़मर्रा की ज़रूरी चीज़ों—सेवाओं, स्थानीय स्थानों, सामुदायिक अपडेट और आसपास के लोगों—तक पहुँचने का एक डिजिटल द्वार।',
    'Explore services': 'सेवाएँ देखें', 'Take a quick tour': 'त्वरित परिचय देखें', 'One place': 'एक ही जगह', 'for everyday services': 'रोज़मर्रा की सेवाओं के लिए',
    'Local first': 'स्थानीय प्राथमिकता', 'built around community': 'समुदाय को ध्यान में रखकर', 'Open to all': 'सभी के लिए खुला', 'accessible by design': 'सुलभता को ध्यान में रखकर',
    'Community hub': 'सामुदायिक केंद्र', 'Connected services': 'जुड़ी हुई सेवाएँ', 'VillageConnect · built around you': 'VillageConnect · आपकी ज़रूरतों के लिए',
    'Find a service': 'सेवा खोजें', 'Health, learning and public support': 'स्वास्थ्य, शिक्षा और सार्वजनिक सहायता', 'Explore nearby': 'आसपास देखें',
    'Places, people and local business': 'स्थान, लोग और स्थानीय व्यवसाय', "What's happening": 'क्या हो रहा है', 'Community news and events': 'सामुदायिक समाचार और कार्यक्रम',
    'YOUR COMMUNITY AT A GLANCE': 'आपका समुदाय एक नज़र में', 'Explore the area.': 'इलाके को जानें।', "See what's happening.": 'जानें कि क्या हो रहा है।',
    'Start with a real map around Pauri Garhwal, then catch up with the community board.': 'पौड़ी गढ़वाल के आसपास के वास्तविक मानचित्र से शुरुआत करें और फिर सामुदायिक सूचना-पट देखें।', 'Start with a real map for your area, then catch up with the community board.': 'अपने इलाके के वास्तविक मानचित्र से शुरुआत करें और फिर सामुदायिक सूचना-पट देखें।',
    'FIND YOUR WAY': 'अपना रास्ता खोजें', 'Explore the area': 'इलाके को देखें', 'Showing Pauri Garhwal, Uttarakhand on Google Maps.': 'Google Maps पर पौड़ी गढ़वाल, उत्तराखंड दिखाया जा रहा है।', 'Showing your saved area on Google Maps.': 'Google Maps पर आपका सहेजा गया इलाका दिखाया जा रहा है।',
    'COMMUNITY BOARD': 'सामुदायिक सूचना-पट', 'See updates': 'अपडेट देखें', 'Keep up with village life': 'गाँव की गतिविधियों से जुड़े रहें',
    'Browse community notices and discover upcoming local events.': 'सामुदायिक सूचनाएँ देखें और आने वाले स्थानीय कार्यक्रमों को जानें।', 'Open the community board ↗': 'सामुदायिक सूचना-पट खोलें ↗',
    'Have a local update to share?': 'क्या आपके पास साझा करने के लिए कोई स्थानीय अपडेट है?', 'Send a suggestion through the contact page.': 'संपर्क पृष्ठ के माध्यम से सुझाव भेजें।',
    'MADE FOR EVERYDAY LIFE': 'रोज़मर्रा की ज़िंदगी के लिए', 'Good things are': 'अच्छी चीज़ें', 'closer than you think.': 'आपकी सोच से भी करीब हैं।', 'All services': 'सभी सेवाएँ',
    'Public services': 'सार्वजनिक सेवाएँ', 'Clear starting points for documents, local support and essential information.': 'दस्तावेज़ों, स्थानीय सहायता और ज़रूरी जानकारी के लिए स्पष्ट शुरुआती रास्ते।',
    'Explore': 'देखें', 'Health & wellbeing': 'स्वास्थ्य और कल्याण', 'Find nearby care and useful health resources for your family.': 'अपने परिवार के लिए नज़दीकी स्वास्थ्य सेवाएँ और उपयोगी संसाधन खोजें।',
    'Local directory': 'स्थानीय निर्देशिका', 'Discover businesses, community spaces and places worth knowing.': 'व्यवसायों, सामुदायिक स्थानों और उपयोगी जगहों को जानें।',
    'Events & updates': 'कार्यक्रम और अपडेट', 'Keep up with village news, gatherings and shared opportunities.': 'गाँव के समाचार, सभाओं और साझा अवसरों से जुड़े रहें।',
    'LOCAL': 'स्थानीय', 'MATTERS': 'महत्वपूर्ण है', 'ROOTED IN COMMUNITY': 'समुदाय से जुड़ा', 'Small moments.': 'छोटे-छोटे पल।', 'Real connection.': 'सच्चा जुड़ाव।',
    'Find the people, places and local knowledge that make a community feel like home. Start with a map, browse a directory or share an idea.': 'उन लोगों, जगहों और स्थानीय जानकारी को खोजें जो समुदाय को घर जैसा बनाते हैं। मानचित्र से शुरुआत करें, निर्देशिका देखें या अपना विचार साझा करें।',
    'Open the village map': 'गाँव का मानचित्र खोलें', 'Share an idea': 'अपना विचार साझा करें', 'YOUR VILLAGE, YOUR VOICE': 'आपका गाँव, आपकी आवाज़', 'Built better,': 'बेहतर बनें,', 'together.': 'मिलकर।',
    'Know what would make this portal more useful? Share a suggestion or let us know what your community needs most.': 'क्या आप जानते हैं कि इस पोर्टल को और उपयोगी कैसे बनाया जा सकता है? सुझाव दें या बताएं कि आपके समुदाय को किस चीज़ की सबसे अधिक ज़रूरत है।', 'Get in touch': 'संपर्क करें',

    // Discover page
    'Discover Nearby — VillageConnect': 'आसपास खोजें — VillageConnect', 'LOCAL KNOWLEDGE, OPEN TO ALL': 'स्थानीय जानकारी, सभी के लिए', 'Find your': 'खोजें अपने', 'people & places.': 'लोग और स्थान।',
    'Search real places in your area with Google Maps. Choose a category to explore nearby care, public services, learning, local businesses and community spaces.': 'Google Maps की मदद से अपने इलाके के वास्तविक स्थान खोजें। स्वास्थ्य सेवाओं, सार्वजनिक सेवाओं, शिक्षा, स्थानीय व्यवसायों और सामुदायिक स्थानों को देखने के लिए कोई श्रेणी चुनें।',
    'Filter place categories': 'स्थान श्रेणियाँ फ़िल्टर करें', 'Search categories…': 'श्रेणियाँ खोजें…', 'Browse categories': 'श्रेणियाँ देखें', 'Choose a category to search the map': 'मानचित्र पर खोजने के लिए कोई श्रेणी चुनें',
    'HEALTH & CARE': 'स्वास्थ्य और देखभाल', 'Clinics & pharmacies': 'क्लिनिक और फ़ार्मेसी', 'Find healthcare centres, doctors, pharmacies and other care nearby.': 'आसपास के स्वास्थ्य केंद्र, डॉक्टर, फ़ार्मेसी और अन्य देखभाल सेवाएँ खोजें।', 'Search this category ↗': 'इस श्रेणी में खोजें ↗',
    'PUBLIC SERVICES': 'सार्वजनिक सेवाएँ', 'Government offices': 'सरकारी कार्यालय', 'Locate civic offices and public service centres in the area you choose.': 'अपने चुने हुए इलाके में नागरिक कार्यालय और सार्वजनिक सेवा केंद्र खोजें।',
    'LEARNING': 'शिक्षा', 'Schools & libraries': 'स्कूल और पुस्तकालय', 'Explore schools, libraries, learning spaces and training providers.': 'स्कूल, पुस्तकालय, अध्ययन स्थल और प्रशिक्षण केंद्र देखें।',
    'LOCAL BUSINESS': 'स्थानीय व्यवसाय', 'Shops & markets': 'दुकानें और बाज़ार', 'Find local shops, markets and everyday essentials close to home.': 'घर के पास की दुकानें, बाज़ार और रोज़मर्रा की ज़रूरी चीज़ें खोजें।',
    'COMMUNITY': 'समुदाय', 'Community spaces': 'सामुदायिक स्थान', 'Look for libraries, halls, meeting spaces and local organizations.': 'पुस्तकालय, सभागार, बैठक स्थल और स्थानीय संगठन खोजें।',
    'TOURISM & OUTDOORS': 'पर्यटन और बाहरी गतिविधियाँ', 'Parks & places to visit': 'पार्क और घूमने की जगहें', 'Discover public parks, walking routes and places to explore nearby.': 'सार्वजनिक पार्क, पैदल चलने के मार्ग और आसपास घूमने की जगहें खोजें।',
    'No categories found': 'कोई श्रेणी नहीं मिली', 'Try another word to find a matching place category.': 'मेल खाती स्थान श्रेणी खोजने के लिए कोई दूसरा शब्द आज़माएँ।',
    'Map results are provided by Google Maps. Confirm addresses, opening hours and accessibility with each place before visiting.': 'मानचित्र के परिणाम Google Maps से मिलते हैं। जाने से पहले हर स्थान का पता, खुलने का समय और पहुँच-सुविधा की पुष्टि करें।', 'Set your area ↗': 'अपना इलाका सेट करें ↗',

    // Updates page
    'Updates & Events — VillageConnect': 'अपडेट और कार्यक्रम — VillageConnect', 'FROM AROUND THE COMMUNITY': 'समुदाय से समाचार', "What's going": 'क्या चल', 'on nearby?': 'रहा है आसपास?',
    'A community board for notices, gatherings and local news. Find public events near your village or suggest an update for this portal.': 'सूचनाओं, सभाओं और स्थानीय समाचारों के लिए सामुदायिक सूचना-पट। अपने गाँव के आसपास सार्वजनिक कार्यक्रम खोजें या इस पोर्टल के लिए अपडेट सुझाएँ।',
    'Local notices': 'स्थानीय सूचनाएँ', 'Enter your region, area and PIN code. VillageConnect uses that location for the map and shows current notices from official district portals discovered through India’s Government Directory. If no matching district notice feed is available, recent Government of India PIB releases may be shown instead.': 'अपना राज्य/क्षेत्र, इलाका और पिन कोड दर्ज करें। VillageConnect भारत की सरकारी निर्देशिका से खोजे गए आधिकारिक जिला पोर्टलों की नवीनतम सूचनाएँ दिखाता है। यदि संबंधित ज़िले का सूचना फ़ीड उपलब्ध न हो, तो भारत सरकार के PIB की हाल की विज्ञप्तियाँ दिखाई जा सकती हैं।',
    'Region / State': 'क्षेत्र / राज्य', 'Area / District': 'इलाका / ज़िला', 'PIN code': 'पिन कोड', 'e.g. Uttarakhand': 'जैसे उत्तराखंड', 'e.g. Pauri Garhwal': 'जैसे पौड़ी गढ़वाल', 'e.g. 246001': 'जैसे 246001',
    'Find notices & update map': 'सूचनाएँ खोजें और मानचित्र अपडेट करें', 'Use my current location': 'मेरी वर्तमान लोकेशन इस्तेमाल करें', 'FIND PUBLIC EVENTS': 'सार्वजनिक कार्यक्रम खोजें',
    'Enter your area to explore Google Maps results for public events and services.': 'सार्वजनिक कार्यक्रमों और सेवाओं के लिए Google Maps परिणाम देखने हेतु अपना इलाका दर्ज करें।', 'Explore map categories': 'मानचित्र की श्रेणियाँ देखें', 'Showing markets around ': 'इनके आसपास बाज़ार दिखाए जा रहे हैं: ', 'Showing learning around ': 'इनके आसपास शिक्षा स्थल दिखाए जा रहे हैं: ', 'Showing health & wellbeing around ': 'इनके आसपास स्वास्थ्य और कल्याण सेवाएँ दिख रही हैं: ', 'Showing community gatherings around ': 'इनके आसपास सामुदायिक सभाएँ दिख रही हैं: ', 'Loading recent official notices…': 'हाल की आधिकारिक सूचनाएँ लोड हो रही हैं…', 'Keep up with village life': 'गाँव की गतिविधियों से जुड़े रहें', 'Browse verified government notices and discover local updates for your saved area.': 'अपने सहेजे गए इलाके की सत्यापित सरकारी सूचनाएँ और स्थानीय अपडेट देखें।', 'Showing the selected location on Google Maps.': 'Google Maps पर चुना गया स्थान दिखाया जा रहा है।',
    'Open these results in Google Maps ↗': 'ये परिणाम Google Maps में खोलें ↗', 'Markets': 'बाज़ार', 'Learning': 'शिक्षा', 'Community gatherings': 'सामुदायिक सभाएँ',
    'VillageConnect discovers official district government portals from India’s Government Directory and refreshes current notices automatically. If a district feed is unavailable, recent Government of India PIB releases may be shown instead. VillageConnect is independent; verify important details with the responsible authority.': 'VillageConnect भारत की सरकारी निर्देशिका से आधिकारिक जिला सरकारी पोर्टल खोजता है और नवीनतम सूचनाएँ अपने-आप अपडेट करता है। यदि किसी ज़िले का फ़ीड उपलब्ध न हो, तो भारत सरकार के PIB की हाल की विज्ञप्तियाँ दिखाई जा सकती हैं। VillageConnect एक स्वतंत्र पोर्टल है; महत्वपूर्ण जानकारी की पुष्टि संबंधित प्राधिकरण से करें।',
    'Notices are refreshed by GitHub Actions from government sites discovered through India’s official government directory. If a local notice feed is unavailable, current Government of India PIB releases from available feeds may be shown instead. VillageConnect is independent; verify important details with the responsible authority.': 'सूचनाएँ GitHub Actions द्वारा भारत की आधिकारिक सरकारी निर्देशिका से खोजी गई सरकारी वेबसाइटों से अपडेट की जाती हैं। यदि स्थानीय सूचना फ़ीड उपलब्ध न हो, तो उपलब्ध फ़ीड से भारत सरकार की नवीनतम PIB विज्ञप्तियाँ दिखाई जा सकती हैं। VillageConnect स्वतंत्र है; महत्वपूर्ण जानकारी की पुष्टि संबंधित प्राधिकरण से करें।',
    'Showing the last packaged verified notices while the next GitHub Actions refresh is pending. VillageConnect is independent; verify important details with the responsible authority.': 'अगला GitHub Actions अपडेट होने तक पैकेज में उपलब्ध अंतिम सत्यापित सूचनाएँ दिखाई जा रही हैं। VillageConnect स्वतंत्र है; महत्वपूर्ण जानकारी की पुष्टि संबंधित प्राधिकरण से करें।',
    'Location permission is requested only when you choose this button. Your chosen location is saved in this browser so every VillageConnect page can reuse it. Coordinates are sent to Google Maps and OpenStreetMap for map/reverse lookup; they are not sent to a VillageConnect server.': 'स्थान की अनुमति केवल इस बटन को चुनने पर माँगी जाती है। आपका चुना हुआ स्थान इस ब्राउज़र में सहेजा जाता है ताकि VillageConnect के सभी पृष्ठ उसका उपयोग कर सकें। मानचित्र और स्थान पहचान के लिए निर्देशांक Google Maps और OpenStreetMap को भेजे जाते हैं; वे VillageConnect सर्वर पर नहीं भेजे जाते।',
    'Locating…': 'स्थान खोजा जा रहा है…',
    'Finding your district…': 'आपका ज़िला खोजा जा रहा है…',
    'Location lookup is taking too long. Please enter the location manually.': 'स्थान खोजने में अधिक समय लग रहा है। कृपया स्थान स्वयं दर्ज करें।',
    'Reverse geocoding by OpenStreetMap contributors': 'स्थान पहचान: OpenStreetMap योगदानकर्ता',

    // Contact page
    'Contact — VillageConnect': 'संपर्क — VillageConnect', 'YOUR VOICE MATTERS': 'आपकी आवाज़ महत्वपूर्ण है', 'Help us make': 'इसे बेहतर बनाने में', 'this more useful.': 'हमारी मदद करें।',
    'Share a suggestion about local services, community information or display settings. Your input can help shape a portal that works better for everyone.': 'स्थानीय सेवाओं, सामुदायिक जानकारी या प्रदर्शन सेटिंग्स के बारे में सुझाव दें। आपका सुझाव इस पोर्टल को सभी के लिए अधिक उपयोगी बना सकता है।',
    'SEND A SUGGESTION': 'सुझाव भेजें', 'What should we': 'हम क्या', 'make easier?': 'आसान बनाएँ?', 'What is your message about?': 'आपका संदेश किस बारे में है?',
    'Local places': 'स्थानीय स्थान', 'Community updates': 'सामुदायिक अपडेट', 'Your message': 'आपका संदेश', 'Tell us what would help…': 'बताएँ कि किससे मदद मिलेगी…',
    'Create message to copy': 'कॉपी करने के लिए संदेश बनाएँ', 'Copy message': 'संदेश कॉपी करें', 'A NOTE ABOUT THIS FORM': 'इस फ़ॉर्म के बारे में', 'We listen best': 'हम सबसे अच्छी तरह सुनते हैं', "when it's local.": 'जब बात स्थानीय हो।',
    'This GitHub Pages prototype has no connected inbox. Submitting prepares a message on this device; it is not transmitted. You can copy it and share it with your local office or portal administrator.': 'इस GitHub Pages प्रोटोटाइप में संदेश प्राप्त करने वाला इनबॉक्स जुड़ा नहीं है। सबमिट करने पर संदेश इसी डिवाइस पर तैयार होता है; यह भेजा नहीं जाता। आप इसे कॉपी करके स्थानीय कार्यालय या पोर्टल व्यवस्थापक से साझा कर सकते हैं।',
    'Please do not include passwords, account details or sensitive personal information.': 'कृपया पासवर्ड, खाते का विवरण या संवेदनशील निजी जानकारी शामिल न करें।', 'Need a display setting?': 'प्रदर्शन सेटिंग बदलनी है?',

    // Map page
    'Village Map — VillageConnect': 'गाँव का मानचित्र — VillageConnect', 'A REAL MAP, CENTERED ON YOUR AREA': 'आपके इलाके पर केंद्रित वास्तविक मानचित्र', 'Find your way': 'अपना रास्ता', 'around.': 'खोजें।',
    'Explore places near Pauri Garhwal, Uttarakhand, or enter another village or town. The map shows real Google Maps results.': 'पौड़ी गढ़वाल, उत्तराखंड के आसपास के स्थान देखें या कोई दूसरा गाँव अथवा कस्बा दर्ज करें। मानचित्र Google Maps के वास्तविक परिणाम दिखाता है।', 'Explore places near your saved area, or enter another village or town. The map shows real Google Maps results.': 'अपने सहेजे गए इलाके के आसपास के स्थान देखें या कोई दूसरा गाँव अथवा कस्बा दर्ज करें। मानचित्र Google Maps के वास्तविक परिणाम दिखाता है।',
    'Village, town, district or postcode': 'गाँव, कस्बा, ज़िला या पिन कोड', 'Show on map': 'मानचित्र पर दिखाएँ', 'Use my location': 'मेरी लोकेशन इस्तेमाल करें',
    'Enter an area to load its real map and nearby results.': 'वास्तविक मानचित्र और आसपास के परिणाम देखने के लिए इलाका दर्ज करें।', 'Search nearby categories': 'आसपास की श्रेणियाँ खोजें',
    'Health & care': 'स्वास्थ्य और देखभाल', 'Public services': 'सार्वजनिक सेवाएँ', 'Schools & learning': 'स्कूल और शिक्षा', 'Shops & markets': 'दुकानें और बाज़ार', 'Community places': 'सामुदायिक स्थान',
    'Open Google Maps in a new tab ↗': 'Google Maps को नए टैब में खोलें ↗', 'Map data and place results are provided by Google Maps. Location permission is requested only if you choose “Use my location.” If enabled, your location is saved only in this browser so other VillageConnect pages can reuse it; coordinates are sent to Google Maps and OpenStreetMap for map and area lookup, not to a VillageConnect server.': 'मानचित्र डेटा और स्थानों के परिणाम Google Maps से मिलते हैं। स्थान की अनुमति केवल “मेरी लोकेशन इस्तेमाल करें” चुनने पर माँगी जाती है। अनुमति देने पर आपका स्थान केवल इसी ब्राउज़र में सहेजा जाता है ताकि अन्य VillageConnect पृष्ठ इसका उपयोग कर सकें; निर्देशांक मानचित्र और क्षेत्र पहचान के लिए Google Maps और OpenStreetMap को भेजे जाते हैं, VillageConnect सर्वर को नहीं।',

    // Service guide
    'Service Guide — VillageConnect': 'सेवा मार्गदर्शिका — VillageConnect', 'A CLEARER NEXT STEP': 'अगला कदम और स्पष्ट', 'Service': 'सेवा', 'guide.': 'मार्गदर्शिका।',
    'A practical checklist for finding local support. Requirements differ across villages and agencies, so always confirm with the official service provider.': 'स्थानीय सहायता पाने के लिए एक उपयोगी जाँच-सूची। आवश्यकताएँ गाँवों और एजेंसियों के अनुसार अलग हो सकती हैं, इसलिए आधिकारिक सेवा प्रदाता से पुष्टि करें।',
    'On this page': 'इस पृष्ठ पर', 'Documents': 'दस्तावेज़', 'Water & sanitation': 'जल और स्वच्छता', 'Learning & jobs': 'शिक्षा और रोज़गार', 'Emergency': 'आपातकाल',
    'Before you apply': 'आवेदन करने से पहले', 'Use the responsible government or local service website for current forms, eligibility rules and application status. Before a visit, check which office handles your request and whether you need an appointment.': 'नवीनतम फ़ॉर्म, पात्रता नियम और आवेदन की स्थिति के लिए संबंधित सरकारी या स्थानीय सेवा की वेबसाइट देखें। जाने से पहले पता करें कि कौन-सा कार्यालय आपका अनुरोध संभालता है और क्या समय लेना ज़रूरी है।',
    'Confirm the official service provider and its current requirements.': 'आधिकारिक सेवा प्रदाता और उसकी मौजूदा आवश्यकताओं की पुष्टि करें।', 'Prepare only the documents the provider requests.': 'केवल वही दस्तावेज़ तैयार करें जिनकी प्रदाता माँग करता है।', 'Keep copies of your application and any reference number.': 'अपने आवेदन और संदर्भ संख्या की प्रतियाँ सुरक्षित रखें।',
    'Find a nearby office on Google Maps ↗': 'Google Maps पर नज़दीकी कार्यालय खोजें ↗', 'Find appropriate care': 'उचित स्वास्थ्य सेवा खोजें',
    'Search for licensed local healthcare providers and confirm opening hours directly. VillageConnect is not a medical service and does not provide diagnoses, emergency dispatch or appointment booking.': 'लाइसेंस प्राप्त स्थानीय स्वास्थ्य प्रदाताओं को खोजें और खुलने का समय सीधे उनसे पूछें। VillageConnect चिकित्सा सेवा नहीं है और निदान, आपातकालीन सहायता भेजने या अपॉइंटमेंट बुक करने की सुविधा नहीं देता।',
    'Search care nearby on Google Maps ↗': 'Google Maps पर नज़दीकी स्वास्थ्य सेवा खोजें ↗', 'For a service issue, use the official utility or local authority reporting channel. Note the location and time of the issue and follow the provider\'s instructions.': 'सेवा संबंधी समस्या के लिए आधिकारिक उपयोगिता विभाग या स्थानीय प्राधिकरण के शिकायत माध्यम का उपयोग करें। समस्या का स्थान और समय नोट करें और प्रदाता के निर्देशों का पालन करें।',
    'Search nearby facilities on Google Maps ↗': 'Google Maps पर नज़दीकी सुविधाएँ खोजें ↗', 'Find learning and work support': 'शिक्षा और रोज़गार सहायता खोजें',
    'Check with schools, libraries, training centres and recognized employment services for current schedules, eligibility and accessibility options.': 'समय-सारणी, पात्रता और सुलभता विकल्पों के लिए स्कूलों, पुस्तकालयों, प्रशिक्षण केंद्रों और मान्यता प्राप्त रोज़गार सेवाओं से पूछें।',
    'Search learning places on Google Maps ↗': 'Google Maps पर शिक्षा स्थल खोजें ↗', 'In an emergency': 'आपातकाल में', 'This portal is not monitored and cannot dispatch help. If there is immediate danger, call the official emergency number for your country or go to the nearest emergency department.': 'इस पोर्टल की निगरानी नहीं होती और यह सहायता भेज नहीं सकता। तत्काल खतरे में अपने देश के आधिकारिक आपातकालीन नंबर पर कॉल करें या निकटतम आपातकालीन विभाग जाएँ।',
    'Find an emergency department': 'आपातकालीन विभाग खोजें',

    // Services page
    'Services — VillageConnect': 'सेवाएँ — VillageConnect', 'HERE WHEN YOU NEED US': 'ज़रूरत के समय आपके साथ', 'Everyday help,': 'रोज़मर्रा की मदद,', 'made easier.': 'अब आसान।',
    'Find a clear next step for public services, health, learning, safety and local support.': 'सार्वजनिक सेवाओं, स्वास्थ्य, शिक्षा, सुरक्षा और स्थानीय सहायता के लिए अगला कदम जानें।', 'Search services': 'सेवाएँ खोजें', 'Search services…': 'सेवाएँ खोजें…',
    'Filter services': 'सेवाएँ फ़िल्टर करें', 'All': 'सभी', 'Public': 'सार्वजनिक', 'Health': 'स्वास्थ्य', 'Community': 'समुदाय', 'Browse all service types': 'सभी सेवा प्रकार देखें',
    'Documents & certificates': 'दस्तावेज़ और प्रमाणपत्र', 'Prepare for common applications, certificates and local office visits.': 'आम आवेदनों, प्रमाणपत्रों और स्थानीय कार्यालय के दौरे की तैयारी करें।', 'Read the service guide': 'सेवा मार्गदर्शिका पढ़ें',
    'Care near you': 'आपके नज़दीक स्वास्थ्य सेवा', 'Find health centres, clinics and pharmacies around your area.': 'अपने इलाके में स्वास्थ्य केंद्र, क्लिनिक और फ़ार्मेसी खोजें।', 'Search nearby care on Google Maps': 'Google Maps पर नज़दीकी स्वास्थ्य सेवा खोजें',
    'EDUCATION & SKILLS': 'शिक्षा और कौशल', 'Learning and jobs': 'शिक्षा और रोज़गार', 'Explore schools, libraries, training and employment support.': 'स्कूल, पुस्तकालय, प्रशिक्षण और रोज़गार सहायता देखें।', 'Find learning places on Google Maps': 'Google Maps पर शिक्षा स्थल खोजें',
    'LOCAL GOVERNMENT': 'स्थानीय शासन', 'Government & civic help': 'सरकारी और नागरिक सहायता', 'Look for local government offices and public information services.': 'स्थानीय सरकारी कार्यालय और सार्वजनिक सूचना सेवाएँ खोजें।', 'Find a local office on Google Maps': 'Google Maps पर स्थानीय कार्यालय खोजें',
    'Find local utility offices and community facilities for essential services.': 'ज़रूरी सेवाओं के लिए स्थानीय उपयोगिता कार्यालय और सामुदायिक सुविधाएँ खोजें।', 'Read practical guidance': 'व्यावहारिक मार्गदर्शन पढ़ें',
    'SAFETY & SUPPORT': 'सुरक्षा और सहायता', 'Emergency help': 'आपातकालीन सहायता', 'Find the official emergency and public safety resources for your area.': 'अपने इलाके के आधिकारिक आपातकालीन और सार्वजनिक सुरक्षा संसाधन खोजें।', 'Safety information': 'सुरक्षा जानकारी',
    'No services found': 'कोई सेवा नहीं मिली', 'Try another word or choose a different category.': 'कोई दूसरा शब्द आज़माएँ या अलग श्रेणी चुनें।',
    'Service availability, eligibility and office hours vary by location. Confirm details with the responsible public agency. In an emergency, contact your local emergency service directly.': 'सेवा की उपलब्धता, पात्रता और कार्यालय के समय स्थान के अनुसार अलग हो सकते हैं। संबंधित सार्वजनिक एजेंसी से पुष्टि करें। आपातकाल में सीधे स्थानीय आपातकालीन सेवा से संपर्क करें।', 'Find nearby help ↗': 'नज़दीकी सहायता खोजें ↗',

    // Settings page
    'Settings — VillageConnect': 'सेटिंग्स — VillageConnect', 'DESIGNED FOR MORE PEOPLE': 'अधिक लोगों के लिए बनाया गया', 'Settings for your': 'आपके अनुभव की', 'experience.': 'सेटिंग्स।',
    'Personalize the display to suit your needs. Your preferences are saved in this browser and apply across the site.': 'अपनी ज़रूरत के अनुसार प्रदर्शन बदलें। आपकी पसंद इस ब्राउज़र में सहेजी जाती है और पूरी साइट पर लागू होती है।',
    'DISPLAY SETTINGS': 'प्रदर्शन सेटिंग्स', 'Make yourself': 'अपने अनुभव को', 'comfortable.': 'सुविधाजनक बनाएँ।', 'These settings apply in this browser and can be changed at any time.': 'ये सेटिंग्स इस ब्राउज़र पर लागू होती हैं और कभी भी बदली जा सकती हैं।',
    'Text size': 'पाठ का आकार', 'Increase or decrease page text.': 'पृष्ठ के पाठ का आकार बढ़ाएँ या घटाएँ।', 'Decrease text size': 'पाठ का आकार घटाएँ', 'Increase text size': 'पाठ का आकार बढ़ाएँ',
    'High contrast': 'उच्च कंट्रास्ट', 'Strengthen text and background contrast.': 'पाठ और पृष्ठभूमि के कंट्रास्ट को बढ़ाएँ।', 'Turn on': 'चालू करें', 'Turn off': 'बंद करें',
    'Reduce motion': 'गतिशीलता कम करें', 'Reduce smooth scrolling and animated movement.': 'स्मूद स्क्रॉलिंग और एनिमेशन कम करें।', 'Your display settings are stored only in this browser.': 'आपकी प्रदर्शन सेटिंग्स केवल इसी ब्राउज़र में सहेजी जाती हैं।',

    // Common generated notice categories and content from the packaged dataset
    'Government': 'सरकार', 'Election': 'चुनाव', 'Health': 'स्वास्थ्य', 'Education': 'शिक्षा', 'Recruitment': 'भर्ती', 'Tender': 'निविदा', 'Public safety': 'सार्वजनिक सुरक्षा', 'Agriculture': 'कृषि',
    'Official government source ↗': 'आधिकारिक सरकारी स्रोत ↗', 'Time not listed': 'समय उपलब्ध नहीं', 'Date not listed': 'तारीख उपलब्ध नहीं',
    'Government of India · PIB update': 'भारत सरकार · PIB सूचना',

    // Form, location, filtering and dynamically generated feedback
    'Type a service, place or topic to search.': 'खोजने के लिए सेवा, स्थान या विषय लिखें।',
    'No exact match. Browse: ': 'सटीक मिलान नहीं मिला। देखें: ', 'Suggested for “': 'इसके लिए सुझाव “',
    'Your location is shown on Google Maps and saved only in this browser so other VillageConnect pages can reuse it.': 'आपका स्थान Google Maps पर दिखाया जा रहा है और केवल इसी ब्राउज़र में सहेजा गया है ताकि VillageConnect के अन्य पृष्ठ उसका उपयोग कर सकें।',
    'Waiting for your browser location permission…': 'ब्राउज़र से स्थान की अनुमति की प्रतीक्षा है…', 'Requesting your location permission…': 'आपके स्थान की अनुमति माँगी जा रही है…',
    'Location access is not available in this browser. Enter your village or town instead.': 'इस ब्राउज़र में स्थान सुविधा उपलब्ध नहीं है। इसके बजाय अपना गाँव या कस्बा दर्ज करें।',
    'Location permission was not granted. You can enter a village or town instead.': 'स्थान की अनुमति नहीं मिली। आप इसके बजाय गाँव या कस्बा दर्ज कर सकते हैं।', 'Could not read your location. Please enter a village or town instead.': 'आपका स्थान नहीं पढ़ा जा सका। कृपया गाँव या कस्बा दर्ज करें।',
    'Loading the latest collected government notices…': 'एकत्र की गई नवीनतम सरकारी सूचनाएँ लोड हो रही हैं…', 'Finding verified notices': 'सत्यापित सूचनाएँ खोजी जा रही हैं', 'Matching your area to the latest government notice data.': 'आपके इलाके का मिलान नवीनतम सरकारी सूचना डेटा से किया जा रहा है।',
    'No verified government notices found': 'कोई सत्यापित सरकारी सूचना नहीं मिली', 'See the official government notice for full details.': 'पूरे विवरण के लिए आधिकारिक सरकारी सूचना देखें।',
    'Some official source content for this area could not be read in a usable notice format. Any malformed entries were hidden; please open the official source or check again after the next refresh.': 'इस इलाके के कुछ आधिकारिक स्रोतों की सामग्री सूचना के उपयोगी प्रारूप में नहीं पढ़ी जा सकी। गलत प्रारूप वाली प्रविष्टियाँ छिपा दी गई हैं; कृपया आधिकारिक स्रोत खोलें या अगले अपडेट के बाद फिर जाँचें।',
    'Could not access your current location. Please enter your region and area manually.': 'आपका वर्तमान स्थान प्राप्त नहीं हो सका। कृपया अपना राज्य और इलाका स्वयं दर्ज करें।',
    'Please enter a valid 6-digit PIN code.': 'कृपया 6 अंकों का सही पिन कोड दर्ज करें।',
    'Location access is not available in this browser. Enter your region and area manually.': 'इस ब्राउज़र में स्थान सुविधा उपलब्ध नहीं है। अपना क्षेत्र और इलाका स्वयं दर्ज करें।',
    'The map is centered on your current coordinates, but your district could not be identified. Please enter your region and area to load matching notices.': 'मानचित्र आपके वर्तमान निर्देशांकों पर केंद्रित है, लेकिन आपके ज़िले की पहचान नहीं हो सकी। संबंधित सूचनाएँ देखने के लिए अपना राज्य और इलाका दर्ज करें।',
    'Location found. Matching government notices to your district…': 'स्थान मिल गया। आपके ज़िले की सरकारी सूचनाएँ खोजी जा रही हैं…',
    'Could not look up your district. The map is updated to your current coordinates; please enter your region and area manually.': 'आपका ज़िला नहीं खोजा जा सका। मानचित्र आपके वर्तमान निर्देशांकों पर अपडेट है; कृपया अपना राज्य और इलाका स्वयं दर्ज करें।',
    'Your location was not shared. You can enter your region and area manually.': 'आपका स्थान साझा नहीं किया गया। आप अपना राज्य और इलाका स्वयं दर्ज कर सकते हैं।',
    'Your message draft is ready on this device. Copy it below to share with your local portal administrator; nothing has been sent.': 'आपके संदेश का प्रारूप इसी डिवाइस पर तैयार है। इसे कॉपी करके स्थानीय पोर्टल व्यवस्थापक से साझा करें; कोई संदेश भेजा नहीं गया है।',
    'Message copied. You can paste it into your local contact channel.': 'संदेश कॉपी हो गया। आप इसे अपने स्थानीय संपर्क माध्यम में पेस्ट कर सकते हैं।', 'Clipboard access is unavailable. You can select and copy your message manually.': 'क्लिपबोर्ड उपलब्ध नहीं है। आप संदेश चुनकर स्वयं कॉपी कर सकते हैं।',
    "Your email (optional, if you'd like a reply)": 'आपका ईमेल (वैकल्पिक, यदि आप जवाब चाहते हैं)',
    'Send message': 'संदेश भेजें',
    'Messages are emailed to the VillageConnect inbox through FormSubmit. Add your email if you would like a reply. The first submission requires the inbox owner to confirm a one-time activation email before delivery begins.': 'संदेश FormSubmit के माध्यम से VillageConnect के इनबॉक्स पर ईमेल किए जाते हैं। जवाब पाने के लिए अपना ईमेल जोड़ें। पहली बार संदेश भेजने पर डिलीवरी शुरू करने से पहले इनबॉक्स मालिक को एक बार सक्रियण ईमेल की पुष्टि करनी होगी।',
    'Your message was submitted. If this is the first submission, delivery will begin after the inbox owner confirms FormSubmit’s activation email.': 'आपका संदेश जमा हो गया है। यदि यह पहली बार है, तो इनबॉक्स मालिक द्वारा FormSubmit के सक्रियण ईमेल की पुष्टि करने के बाद संदेश पहुँचने शुरू होंगे।',
    'Sending your message…': 'आपका संदेश भेजा जा रहा है…',
    'Message copied. You can paste it into your email or another contact channel.': 'संदेश कॉपी हो गया। आप इसे अपने ईमेल या किसी अन्य संपर्क माध्यम में पेस्ट कर सकते हैं।',
  }).map(([english, translation]) => [normalize(english).toLowerCase(), translation]));

  const translateValue = (value, language) => {
    if (language !== 'hi') return value;
    const key = normalize(value).toLowerCase();
    if (hindi.has(key)) return hindi.get(key);

    let match = normalize(value).match(/^(\d+)\s*\/\s*500 characters$/i);
    if (match) return `${match[1]} / 500 अक्षर`;
    match = normalize(value).match(/^(\d+)\s+(category|categories) found$/i);
    if (match) return `${match[1]} ${match[1] === '1' ? 'श्रेणी मिली' : 'श्रेणियाँ मिलीं'}`;
    match = normalize(value).match(/^Explore Google Maps results around (.+)\.$/i);
    if (match) return `${match[1]} के आसपास Google Maps के परिणाम देखें।`;
    match = normalize(value).match(/^Map preview for (.+) is paused\. Choose “Load interactive map” to display it\.$/i);
    if (match) return `${match[1]} के लिए मानचित्र पूर्वावलोकन रुका हुआ है। इसे दिखाने के लिए “इंटरैक्टिव मानचित्र लोड करें” चुनें।`;
    match = normalize(value).match(/^Google Maps results for (.+) are ready\. Load the interactive map to preview them here, or open Google Maps in a new tab\.$/i);
    if (match) return `Google Maps के ${match[1]} परिणाम तैयार हैं। यहाँ पूर्वावलोकन देखने के लिए इंटरैक्टिव मानचित्र लोड करें, या Google Maps को नए टैब में खोलें।`;
    match = normalize(value).match(/^Showing Google Maps results for (.+)\.$/i);
    if (match) return `${match[1]} के लिए Google Maps परिणाम दिखाए जा रहे हैं।`;
    match = normalize(value).match(/^Showing (.+) on Google Maps\.$/i);
    if (match) return `Google Maps पर ${match[1]} दिखाया जा रहा है।`;
    match = normalize(value).match(/^Showing (\d+) verified government notices for (.+?)(?: · refreshed (.+))?\.$/i);
    if (match) return `${match[2]} के लिए ${match[1]} सत्यापित सरकारी सूचनाएँ दिखाई जा रही हैं${match[3] ? ` · अपडेट: ${match[3]}` : ''}।`;
    match = normalize(value).match(/^No verified government notices were found for (.+)\.$/i);
    if (match) return `${match[1]} के लिए कोई सत्यापित सरकारी सूचना नहीं मिली।`;
    match = normalize(value).match(/^No district-specific notices were found for (.+); showing current Government of India PIB releases instead\.$/i);
    if (match) return `${match[1]} के लिए ज़िला-विशिष्ट सूचना नहीं मिली; इसके बजाय भारत सरकार की नवीनतम विज्ञप्तियाँ दिखाई जा रही हैं।`;
    match = normalize(value).match(/^No current verified government notices are available for (.+)\. The site will try again after the next scheduled refresh\.$/i);
    if (match) return `${match[1]} के लिए अभी कोई सत्यापित सरकारी सूचना उपलब्ध नहीं है। अगला निर्धारित अपडेट होने पर फिर प्रयास किया जाएगा।`;
    match = normalize(value).match(/^No configured official government source is available yet for (.+)\. Google Maps still updates normally\.$/i);
    if (match) return `${match[1]} के लिए अभी कोई निर्धारित आधिकारिक सरकारी स्रोत उपलब्ध नहीं है। Google Maps सामान्य रूप से अपडेट होता रहेगा।`;
    match = normalize(value).match(/^Showing Google Maps results for (.+)\. Select “Open Google Maps” to see place details and directions\.$/i);
    if (match) return `${match[1]} के लिए Google Maps परिणाम दिखाए जा रहे हैं। स्थान के विवरण और दिशा-निर्देश देखने के लिए “Google Maps खोलें” चुनें।`;
    match = normalize(value).match(/^There are no collected notices for (.+) yet\. Try the district name, or check again after the next scheduled refresh\.$/i);
    if (match) return `अभी ${match[1]} के लिए कोई सूचना एकत्र नहीं हुई है। ज़िले का नाम आज़माएँ या अगले निर्धारित अपडेट के बाद फिर देखें।`;
    match = normalize(value).match(/^Your map is centered on your current location \(([^)]+)\) while the district is identified\.$/i);
    if (match) return `ज़िले की पहचान होने तक मानचित्र आपके वर्तमान स्थान (${match[1]}) पर केंद्रित है।`;
    match = normalize(value).match(/^Showing your current coordinates on Google Maps\. Reverse geocoding by OpenStreetMap contributors\.$/i);
    if (match) return 'Google Maps पर आपके वर्तमान निर्देशांक दिखाए जा रहे हैं। स्थान की पहचान OpenStreetMap योगदानकर्ताओं की सेवा से की जाती है।';
    match = normalize(value).match(/^Start with a real map around (.+), then catch up with the community board\.$/i);
    if (match) return `${match[1]} के आसपास के वास्तविक मानचित्र से शुरुआत करें और फिर सामुदायिक सूचना-पट देखें।`;
    match = normalize(value).match(/^Showing (markets|learning|health & wellbeing|community gatherings) around (.+?)(?: on Google Maps)?\.$/i);
    if (match) { const labels = { markets: 'बाज़ार', learning: 'शिक्षा स्थल', 'health & wellbeing': 'स्वास्थ्य और कल्याण सेवाएँ', 'community gatherings': 'सामुदायिक सभाएँ' }; return `${match[2]} के आसपास ${labels[match[1].toLowerCase()]} दिखाए जा रहे हैं।`; }
    match = normalize(value).match(/^Recent verified notices for (.+?)(?: · refreshed (.+))?\.$/i);
    if (match) return `${match[1]} के लिए हाल की सत्यापित सूचनाएँ${match[2] ? ` · अपडेट: ${match[2]}` : ''}।`;
    match = normalize(value).match(/^Showing public events and services around (.+?)(?: on Google Maps)?\.$/i);
    if (match) return `${match[1]} के आसपास सार्वजनिक कार्यक्रम और सेवाएँ दिखाई जा रही हैं।`;
    match = normalize(value).match(/^No verified notices are currently available for (.+)\. Open the Updates page to check the latest notice index\.$/i);
    if (match) return `${match[1]} के लिए अभी कोई सत्यापित सूचना उपलब्ध नहीं है। नवीनतम सूचना सूची देखने के लिए अपडेट पृष्ठ खोलें।`;
    match = normalize(value).match(/^No district-specific notices in the latest index; showing Government of India updates\s*(.*)$/i);
    if (match) return `नवीनतम सूची में ज़िला-विशिष्ट सूचनाएँ नहीं हैं; भारत सरकार के अपडेट दिखाए जा रहे हैं। ${match[1] || ''}`.trim();
    if (normalize(value) === 'Official notices could not be loaded right now. Please try the Updates page again later.') return 'अभी आधिकारिक सूचनाएँ लोड नहीं हो सकीं। कृपया बाद में अपडेट पृष्ठ पर फिर प्रयास करें।';
    match = normalize(value).match(/^Recent verified notices for (.+?)(?: · refreshed (.+))?\.$/i);
    if (match) return `${match[1]} के लिए हाल की सत्यापित सूचनाएँ${match[2] ? ` · अपडेट: ${match[2]}` : ''}।`;
    return value;
  };

  const textOriginals = new WeakMap();
  const attrOriginals = new WeakMap();
  let currentLanguage = 'en';
  let applyingLanguage = false;
  let observer;

  const isExcluded = node => {
    const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    return !element || !!element.closest('script,style,noscript,template,[data-vc-no-translate="true"]');
  };

  const translateTextNode = node => {
    if (isExcluded(node)) return;
    const now = node.nodeValue || '';
    let original = textOriginals.get(node);
    if (original === undefined) {
      original = now;
      textOriginals.set(node, original);
    } else if (!applyingLanguage && now !== original && now !== translateValue(original, currentLanguage)) {
      // Page scripts may replace an existing text node with new English UI text.
      original = now;
      textOriginals.set(node, original);
    }
    const converted = translateValue(original, currentLanguage);
    if (now !== converted) node.nodeValue = converted;
  };

  const attributeNames = ['placeholder', 'title', 'aria-label', 'alt'];
  const translateAttributes = element => {
    if (!(element instanceof Element) || element.closest('[data-vc-no-translate="true"]')) return;
    let originals = attrOriginals.get(element);
    if (!originals) { originals = new Map(); attrOriginals.set(element, originals); }
    attributeNames.forEach(name => {
      if (!element.hasAttribute(name)) return;
      const now = element.getAttribute(name) || '';
      let original = originals.get(name);
      if (original === undefined || (!applyingLanguage && now !== original && now !== translateValue(original, currentLanguage))) {
        original = now;
        originals.set(name, original);
      }
      const converted = translateValue(original, currentLanguage);
      if (now !== converted) element.setAttribute(name, converted);
    });
  };

  const walk = root => {
    if (!root) return;
    if (root.nodeType === Node.TEXT_NODE) { translateTextNode(root); return; }
    if (root.nodeType === Node.ELEMENT_NODE && root.matches('[data-vc-no-translate="true"]')) return;
    if (root.nodeType === Node.ELEMENT_NODE) translateAttributes(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) translateTextNode(node);
    if (root.nodeType === Node.DOCUMENT_NODE) return;
    if (root.querySelectorAll) root.querySelectorAll('*').forEach(translateAttributes);
  };

  const setToggleText = button => {
    const targetLanguage = currentLanguage === 'en' ? 'hi' : 'en';
    button.textContent = currentLanguage === 'en' ? 'हिंदी' : 'English';
    button.setAttribute('aria-label', currentLanguage === 'en' ? 'हिंदी भाषा चुनें' : 'Switch language to English');
    button.title = currentLanguage === 'en' ? 'हिंदी भाषा चुनें' : 'Switch language to English';
    button.dataset.targetLanguage = targetLanguage;
  };

  const applyLanguage = language => {
    currentLanguage = language === 'hi' ? 'hi' : 'en';
    document.documentElement.lang = currentLanguage;
    applyingLanguage = true;
    walk(document.body);
    applyingLanguage = false;
    const titleOriginal = document.title.replace(/^.*$/, document.title);
    const titleMap = {
      'VillageConnect — Your village, within reach': 'VillageConnect — आपका गाँव, अब आपके करीब',
      'Discover Nearby — VillageConnect': 'आसपास खोजें — VillageConnect',
      'Updates & Events — VillageConnect': 'अपडेट और कार्यक्रम — VillageConnect',
      'Contact — VillageConnect': 'संपर्क — VillageConnect', 'Village Map — VillageConnect': 'गाँव का मानचित्र — VillageConnect',
      'Service Guide — VillageConnect': 'सेवा मार्गदर्शिका — VillageConnect', 'Services — VillageConnect': 'सेवाएँ — VillageConnect', 'Settings — VillageConnect': 'सेटिंग्स — VillageConnect'
    };
    if (currentLanguage === 'hi') document.title = titleMap[titleOriginal] || translateValue(titleOriginal, 'hi');
    else document.title = Object.keys(titleMap).find(key => titleMap[key] === titleOriginal) || titleOriginal;
    document.querySelectorAll('.language-toggle').forEach(setToggleText);
    window.dispatchEvent(new CustomEvent('villageconnect:languagechange', { detail: { language: currentLanguage } }));
    try { localStorage.setItem(STORAGE_KEY, currentLanguage); } catch { /* Browser storage may be disabled. */ }
  };

  const addToggle = () => {
    let button = document.querySelector('.language-toggle');
    if (!button) {
      button = document.createElement('button');
      button.type = 'button';
      button.className = 'tool-button language-toggle';
      button.setAttribute('data-vc-no-translate', 'true');
      const host = document.querySelector('.header-actions');
      if (host) {
        const theme = host.querySelector('.theme-toggle');
        if (theme) theme.insertAdjacentElement('afterend', button);
        else host.prepend(button);
      } else {
        button.classList.add('language-toggle-floating');
        document.body.append(button);
      }
      button.addEventListener('click', () => applyLanguage(currentLanguage === 'en' ? 'hi' : 'en'));
    }
    setToggleText(button);
  };

  try { currentLanguage = localStorage.getItem(STORAGE_KEY) === 'hi' ? 'hi' : 'en'; } catch { currentLanguage = 'en'; }
  addToggle();
  applyLanguage(currentLanguage);

  observer = new MutationObserver(records => {
    records.forEach(record => {
      if (record.type === 'characterData') translateTextNode(record.target);
      else {
        record.addedNodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE) translateTextNode(node);
          else if (node.nodeType === Node.ELEMENT_NODE) walk(node);
        });
        if (record.type === 'attributes' && record.target instanceof Element) translateAttributes(record.target);
      }
    });
  });
  observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: attributeNames });

  window.VillageConnectLanguage = {
    get current() { return currentLanguage; },
    translate: (englishText, language = currentLanguage) => translateValue(englishText, language),
    set: applyLanguage
  };
})();
