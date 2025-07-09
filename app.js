document.addEventListener('DOMContentLoaded', () => {
    const storyTextElement = document.getElementById('storyText');
    const choicesElement = document.getElementById('choices');
    const errorDisplay = document.getElementById('errorDisplay');
    const versionInfo = document.getElementById('versionInfo');
    const storyStatus = document.getElementById('storyStatus');
    
    // 显示状态信息
    function updateStatus(message) {
        storyStatus.textContent = `状态: ${message}`;
        console.log(`状态: ${message}`);
    }
    
    // 显示错误信息
    function showError(message) {
        console.error(message);
        errorDisplay.style.display = 'block';
        errorDisplay.textContent = message;
        storyTextElement.innerHTML = `<p style="color:#c62828;text-align:center;">${message}</p>`;
        updateStatus(`错误: ${message}`);
    }
    
    // 检查inkjs是否加载
    updateStatus('检查inkjs引擎');
    
    if (typeof inkjs === 'undefined') {
        showError('inkjs引擎未加载！请检查网络连接或脚本路径');
        return;
    }
    
    // 显示inkjs版本
    versionInfo.textContent = `inkjs版本: ${inkjs.version}`;
    updateStatus('inkjs已加载');
    
    // 使用您的故事文件test1.json
    const storyFilePath = 'stories/test1.json';
    
    updateStatus('正在加载故事文件: ' + storyFilePath);
    
    // 尝试加载故事文件
    fetch(storyFilePath)
        .then(response => {
            if (!response.ok) {
                // 提供更详细的错误信息
                if (response.status === 404) {
                    throw new Error(`文件未找到: ${storyFilePath}`);
                } else {
                    throw new Error(`文件加载失败 (HTTP状态: ${response.status})`);
                }
            }
            return response.json();
        })
        .then(storyJson => {
            updateStatus('故事文件已加载，正在初始化');
            console.log('故事JSON内容:', storyJson); // 打印故事内容到控制台
            initStory(storyJson);
        })
        .catch(error => {
            console.error('加载故事失败:', error);
            showError(`加载故事失败: ${error.message}`);
            
            // 在页面上显示更详细的帮助信息
            const helpInfo = document.createElement('div');
            helpInfo.innerHTML = `
                <h3>问题排查建议:</h3>
                <ol>
                    <li>检查 <code>stories/test1.json</code> 文件是否存在</li>
                    <li>确认文件名和路径完全匹配（区分大小写）</li>
                    <li>确保文件是有效的JSON格式</li>
                    <li>如果使用本地文件，尝试使用本地服务器而不是直接打开HTML文件</li>
                </ol>
                <p><button onclick="location.reload()">重新加载</button></p>
            `;
            storyTextElement.appendChild(helpInfo);
        });

    // 初始化故事
    function initStory(storyJson) {
        try {
            updateStatus('创建故事实例');
            const story = new inkjs.Story(storyJson);
            
            // 显示初始故事内容
            showStory(story);
            
            function showStory() {
                // 清空显示区域
                storyTextElement.innerHTML = '';
                choicesElement.innerHTML = '';
                
                updateStatus('渲染故事内容');
                
                // 显示故事文本
                let hasContent = false;
                while (story.canContinue) {
                    const paragraph = story.Continue();
                    const pElement = document.createElement('p');
                    pElement.textContent = paragraph;
                    storyTextElement.appendChild(pElement);
                    hasContent = true;
                }
                
                // 如果没有内容，可能是故事开始有问题
                if (!hasContent) {
                    const warning = document.createElement('p');
                    warning.textContent = "故事内容为空，可能格式不正确";
                    warning.style.color = "#e67e22";
                    storyTextElement.appendChild(warning);
                    
                    // 在控制台输出更多信息
                    console.warn("故事内容为空。可能原因:");
                    console.warn("1. 故事文件格式不正确");
                    console.warn("2. 故事没有起始内容");
                    console.warn("3. JSON结构不符合inkjs要求");
                    console.warn("故事JSON内容:", storyJson);
                }
                
                // 显示选项
                if (story.currentChoices.length > 0) {
                    story.currentChoices.forEach((choice, index) => {
                        const button = document.createElement('button');
                        button.textContent = choice.text;
                        button.onclick = () => {
                            story.ChooseChoiceIndex(index);
                            showStory();
                        };
                        choicesElement.appendChild(button);
                    });
                    updateStatus(`显示 ${story.currentChoices.length} 个选项`);
                } else if (!story.canContinue) {
                    const endElement = document.createElement('p');
                    endElement.textContent = '【故事结束】';
                    endElement.style.fontWeight = 'bold';
                    endElement.style.textAlign = 'center';
                    endElement.style.marginTop = '20px';
                    endElement.style.color = '#27ae60';
                    storyTextElement.appendChild(endElement);
                    updateStatus('故事结束');
                }
            }
        } catch (e) {
            showError(`故事初始化失败: ${e.message}`);
            console.error('故事初始化异常:', e);
        }
    }
});