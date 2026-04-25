set projectPath to POSIX path of "/Volumes/Extreme SSD/AOS_ENTERPRISE_CORE/agents/general/command-deck-panel"
set healthCommand to "if ! /usr/bin/curl -fsS http://127.0.0.1:3000 >/dev/null 2>&1; then cd " & quoted form of projectPath & " && nohup ./start-hq.sh >/tmp/agent-hq.log 2>&1 & fi"
do shell script "/bin/bash -lc " & quoted form of healthCommand
open location "http://127.0.0.1:3000"
activate
