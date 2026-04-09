<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EcoCycle</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body class="bg-gray-50 text-gray-900 antialiased font-sans selection:bg-emerald-200 min-h-screen">
    
    <nav class="bg-white p-4 shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div class="max-w-6xl mx-auto flex justify-between items-center px-2">
            <div class="flex items-center space-x-3">
                <div class="bg-emerald-500 p-2.5 rounded-xl text-white shadow-md shadow-emerald-200">
                    <i data-lucide="leaf" class="w-6 h-6"></i>
                </div>
                <h1 class="text-2xl font-black tracking-tight text-gray-800">
                    Eco<span class="text-emerald-500">Cycle</span>
                </h1>
            </div>
            <div class="w-12 h-12 bg-emerald-100 rounded-full border-2 border-white shadow-md overflow-hidden hover:scale-105 transition-transform cursor-pointer">
                 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jane&backgroundColor=b6e3f4" alt="Avatar" />
            </div>
        </div>
    </nav>

    <main class="max-w-6xl mx-auto p-4 md:p-8 pt-8 md:pt-12">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            
            <!-- Dashboard Column -->
            <div class="lg:col-span-4 space-y-8 order-2 lg:order-1">
                <div class="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100">
                    <div class="flex justify-between items-center mb-6">
                        <div>
                        <h2 class="text-2xl font-black text-gray-800">Clan War</h2>
                        <p class="text-sm text-gray-500 font-medium">Season 4 • Ends in 12 days</p>
                        </div>
                        <div class="bg-amber-100 p-3 rounded-2xl">
                            <i data-lucide="trophy" class="w-8 h-8 text-amber-500"></i>
                        </div>
                    </div>

                    <div class="mb-8">
                        <div class="flex justify-between mb-2">
                            <span class="font-bold text-emerald-600 flex items-center tracking-tight">
                                <i data-lucide="flame" class="w-4 h-4 mr-1 text-emerald-500"></i> Dhanmondi Dragons
                            </span>
                            <span class="font-bold text-rose-500 tracking-tight">Mirpur Mutants</span>
                        </div>
                        
                        <div class="w-full h-8 bg-rose-500 rounded-full flex overflow-hidden shadow-inner relative">
                            <div id="clan-progress-bar"
                                class="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-1000 ease-out flex items-center"
                                style="width: 51.7%">
                                <span id="my-points-display" class="text-white text-xs font-black ml-3 shadow-sm">45,000</span>
                            </div>
                            <div class="absolute right-3 top-0 h-full flex items-center">
                                <span class="text-white text-xs font-black shadow-sm">42,000</span>
                            </div>
                        </div>
                    </div>

                    <div class="bg-gray-50 flex justify-between items-center rounded-2xl p-4 border border-gray-100 hover:bg-emerald-50/50 hover:border-emerald-100 transition-colors cursor-pointer">
                        <div>
                            <h3 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Your Stats</h3>
                            <p class="text-gray-800 font-black text-lg leading-tight">Jane Eco</p>
                            <p class="text-emerald-600 font-bold text-xs">Citizen Defender</p>
                        </div>
                        <div class="text-right">
                            <p id="user-points-display" class="text-3xl font-black text-gray-800">1250</p>
                            <p class="text-[10px] text-gray-500 font-black uppercase tracking-widest">Points</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Scanner Column -->
            <div class="lg:col-span-4 flex items-center justify-center order-1 lg:order-2 mb-8 lg:mb-0">
                <div class="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] w-full max-w-md mx-auto hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-shadow border border-emerald-50">
                    <h2 class="text-2xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">
                        AI Waste Scanner
                    </h2>
                    
                    <div id="scanner-box"
                        class="relative h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all overflow-hidden border-gray-200 hover:border-emerald-300 hover:bg-gray-50 cursor-pointer"
                        onclick="startScan()">
                        
                        <!-- Default State -->
                        <div id="scanner-default" class="flex flex-col items-center">
                            <div class="p-4 bg-emerald-50 rounded-full mb-3 text-emerald-500">
                                <i data-lucide="upload-cloud" class="w-8 h-8"></i>
                            </div>
                            <p class="text-gray-600 font-medium">Tap to scan waste item</p>
                            <p class="text-xs text-gray-400 mt-1">Supports JPG, PNG (Max 5MB)</p>
                        </div>

                        <!-- Scanning State -->
                        <div id="scanner-active" class="hidden relative w-full h-full flex items-center justify-center py-10">
                            <!-- Scanning line animation via Tailwind arbitrary values & typical css -->
                            <div class="absolute w-full h-1 bg-emerald-400 shadow-[0_0_15px_3px_#34d399] animate-[scan_2s_ease-in-out_infinite]"></div>
                            <p class="text-emerald-600 font-bold z-10 tracking-widest text-sm animate-pulse">ANALYZING MATERIAL</p>
                        </div>

                        <!-- Result State -->
                        <div id="scanner-result" class="hidden flex flex-col items-center scale-95 transition-transform duration-300">
                            <i data-lucide="check-circle" class="w-16 h-16 text-teal-500 mb-3 drop-shadow-md"></i>
                            <p id="scan-result-text" class="font-extrabold text-gray-800 tracking-tight">Category: PLASTIC</p>
                            <p class="text-sm font-semibold text-emerald-600 mt-1">+50 Points Rewarded!</p>
                        </div>
                    </div>

                    <div class="mt-6 space-y-2">
                        <div class="flex justify-between text-sm font-bold text-gray-700">
                            <span>AI Confidence Level</span>
                            <span id="confidence-text" class="text-amber-500">0%</span>
                        </div>
                        <div class="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
                            <div id="confidence-bar" class="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 h-full rounded-full transition-all duration-300" style="width: 0%"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Live Feed Column -->
            <div class="lg:col-span-4 order-3 lg:order-3">
                <div class="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 h-full overflow-hidden">
                    <h2 class="text-xl font-black text-gray-800 mb-6">Live Activity 👀</h2>
                    
                    <div id="live-feed-container" class="space-y-4">
                        <div class="flex items-center p-3 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 hover:bg-gray-100 transition-colors">
                            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-inner shrink-0">J</div>
                            <div class="ml-4 flex-1">
                                <p class="text-sm font-bold text-gray-800">John D.</p>
                                <p class="text-xs text-gray-500 font-medium">Cardboard Box</p>
                            </div>
                            <div class="text-right">
                                <p class="text-emerald-500 font-black text-sm">15 <span class="text-[10px]">pts</span></p>
                                <p class="text-[10px] text-gray-400 font-bold">Just now</p>
                            </div>
                        </div>
                        <div class="flex items-center p-3 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 hover:bg-gray-100 transition-colors">
                            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-inner shrink-0">A</div>
                            <div class="ml-4 flex-1">
                                <p class="text-sm font-bold text-gray-800">Alice M.</p>
                                <p class="text-xs text-gray-500 font-medium">Glass Bottle</p>
                            </div>
                            <div class="text-right">
                                <p class="text-emerald-500 font-black text-sm">30 <span class="text-[10px]">pts</span></p>
                                <p class="text-[10px] text-gray-400 font-bold">2m ago</p>
                            </div>
                        </div>
                        <div class="flex items-center p-3 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 hover:bg-gray-100 transition-colors">
                            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-inner shrink-0">K</div>
                            <div class="ml-4 flex-1">
                                <p class="text-sm font-bold text-gray-800">Karim R.</p>
                                <p class="text-xs text-gray-500 font-medium">Newspaper</p>
                            </div>
                            <div class="text-right">
                                <p class="text-emerald-500 font-black text-sm">10 <span class="text-[10px]">pts</span></p>
                                <p class="text-[10px] text-gray-400 font-bold">5m ago</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- Custom Scanner Logic & Scan Keyframe -->
    <style>
        @keyframes scan {
            0% { top: -10%; }
            50% { top: 110%; }
            100% { top: -10%; }
        }
    </style>
    <script>
        lucide.createIcons();

        let isScanning = false;
        let myPoints = 45000;
        let rivalPoints = 42000;
        let myUserPoints = 1250;

        function startScan() {
            if (isScanning) return;
            isScanning = true;

            const scannerBox = document.getElementById('scanner-box');
            const defState = document.getElementById('scanner-default');
            const activeState = document.getElementById('scanner-active');
            const resultState = document.getElementById('scanner-result');
            const confBar = document.getElementById('confidence-bar');
            const confText = document.getElementById('confidence-text');

            // Reset visual state
            defState.classList.add('hidden');
            resultState.classList.add('hidden');
            activeState.classList.remove('hidden');
            resultState.classList.remove('scale-100');
            resultState.classList.add('scale-95');

            scannerBox.classList.remove('border-gray-200', 'hover:border-emerald-300', 'hover:bg-gray-50', 'border-teal-400', 'bg-teal-50/30');
            scannerBox.classList.add('border-emerald-400', 'bg-emerald-50/50');
            
            let progress = 0;
            confText.classList.remove('text-emerald-600');
            confText.classList.add('text-amber-500');

            const interval = setInterval(() => {
                progress += Math.floor(Math.random() * 15) + 8;
                if (progress >= 100) {
                    clearInterval(interval);
                    
                    // Final State
                    confBar.style.width = '92%';
                    confText.innerText = '92%';
                    confText.classList.remove('text-amber-500');
                    confText.classList.add('text-emerald-600');

                    activeState.classList.add('hidden');
                    resultState.classList.remove('hidden');
                    
                    // trigger animation
                    setTimeout(() => {
                        resultState.classList.remove('scale-95');
                        resultState.classList.add('scale-100');
                    }, 50);

                    scannerBox.classList.remove('border-emerald-400', 'bg-emerald-50/50');
                    scannerBox.classList.add('border-teal-400', 'bg-teal-50/30');
                    
                    document.getElementById('scan-result-text').innerText = 'Category: PLASTIC (PET Bottle)';
                    
                    // Add Points!
                    myPoints += 50;
                    myUserPoints += 50;
                    document.getElementById('my-points-display').innerText = myPoints.toLocaleString();
                    document.getElementById('user-points-display').innerText = myUserPoints.toLocaleString();
                    const percentage = (myPoints / (myPoints + rivalPoints)) * 100;
                    document.getElementById('clan-progress-bar').style.width = percentage + '%';

                    // Add Notification
                    const feed = document.getElementById('live-feed-container');
                    const newItem = document.createElement('div');
                    newItem.className = 'flex items-center p-3 bg-emerald-50 rounded-2xl border border-emerald-100 hover:border-emerald-200 transition-colors opacity-0 -translate-y-4';
                    newItem.innerHTML = `
                        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-inner shrink-0">Y</div>
                        <div class="ml-4 flex-1">
                            <p class="text-sm font-bold text-emerald-800">You</p>
                            <p class="text-xs text-emerald-600 font-medium">Earned 50 pts for Pet Bottle!</p>
                        </div>
                        <div class="text-right">
                            <p class="text-emerald-500 font-black text-sm">+50 <span class="text-[10px]">pts</span></p>
                            <p class="text-[10px] text-gray-400 font-bold">Just now</p>
                        </div>
                    `;
                    feed.insertBefore(newItem, feed.firstChild);

                    // Animate in the notification
                    setTimeout(() => {
                        newItem.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                        newItem.classList.remove('opacity-0', '-translate-y-4');
                    }, 50);

                    isScanning = false;
                } else {
                    confBar.style.width = progress + '%';
                    confText.innerText = progress + '%';
                }
            }, 200);
        }
    </script>
</body>
</html>
