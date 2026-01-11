#!/bin/bash
# Frappe Bench Setup Script for Hazelnode
# ========================================
#
# COMPLETED INSTALLATIONS:
# - pyenv with Python 3.14.2 (at ~/.pyenv)
# - nvm with Node 24.12.0 (at /opt/nvm)
# - Homebrew with MariaDB connector (at /home/linuxbrew/.linuxbrew)
# - frappe-bench CLI 5.28.0
# - yarn 1.22.22
# - Frappe bench initialized at ~/frappe/frappe-bench (develop branch)
#
# REMAINING STEPS:
# 1. Start MariaDB server (requires Docker or system install)
# 2. Build assets
# 3. Create a site
# 4. Install hazelnode app

set -e

echo "=== Frappe Bench Setup Script ==="

# Source all environment tools
setup_environment() {
    # Pyenv
    export PYENV_ROOT="$HOME/.pyenv"
    export PATH="$PYENV_ROOT/bin:$PATH"
    eval "$(pyenv init -)"

    # NVM
    export NVM_DIR="/opt/nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm use 24 > /dev/null

    # Homebrew
    eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"

    # MariaDB connector for mysqlclient
    export PKG_CONFIG_PATH="/home/linuxbrew/.linuxbrew/opt/mariadb-connector-c/lib/pkgconfig:$PKG_CONFIG_PATH"
    export LDFLAGS="-L/home/linuxbrew/.linuxbrew/opt/mariadb-connector-c/lib"
    export CPPFLAGS="-I/home/linuxbrew/.linuxbrew/opt/mariadb-connector-c/include"
}

check_versions() {
    echo ""
    echo "=== Installed Versions ==="
    echo "Python: $(python --version)"
    echo "Node: $(node --version)"
    echo "npm: $(npm --version)"
    echo "Yarn: $(yarn --version)"
    echo "Bench: $(pip show frappe-bench 2>/dev/null | grep Version | cut -d' ' -f2)"
    echo "Homebrew: $(brew --version | head -1)"
    echo ""
}

setup_mariadb_docker() {
    echo "=== MariaDB Setup with Docker ==="
    echo ""
    echo "Option 1: Use Docker (requires Docker daemon running)"
    echo ""
    cat << 'DOCKER_CMD'
docker run -d \
    --name mariadb \
    -p 3306:3306 \
    -e MYSQL_ROOT_PASSWORD=admin \
    -e MYSQL_DATABASE=frappe \
    mariadb:11.8

# Wait for MariaDB to be ready
sleep 10

# Test connection
mysql -h 127.0.0.1 -u root -padmin -e "SELECT 1"
DOCKER_CMD
    echo ""
    echo "Option 2: System install (requires sudo)"
    echo ""
    cat << 'SYSTEM_CMD'
sudo apt update
sudo apt install -y mariadb-server mariadb-client
sudo systemctl start mariadb
sudo mariadb-secure-installation
SYSTEM_CMD
    echo ""
}

build_assets() {
    echo "=== Building Assets ==="
    echo ""
    echo "Run the following commands:"
    echo ""
    cat << 'BUILD_CMD'
cd ~/frappe/frappe-bench
source env/bin/activate
bench build
BUILD_CMD
    echo ""
}

create_site() {
    echo "=== Create Site ==="
    echo ""
    echo "Run the following commands (after MariaDB is running):"
    echo ""
    cat << 'SITE_CMD'
cd ~/frappe/frappe-bench
bench new-site hazelnode.local --mariadb-root-password admin --admin-password admin
bench use hazelnode.local
SITE_CMD
    echo ""
}

install_hazelnode() {
    echo "=== Install Hazelnode App ==="
    echo ""
    cat << 'APP_CMD'
cd ~/frappe/frappe-bench
bench get-app /home/user/hazelnode
bench --site hazelnode.local install-app hazelnode
APP_CMD
    echo ""
}

start_bench() {
    echo "=== Start Development Server ==="
    echo ""
    cat << 'START_CMD'
cd ~/frappe/frappe-bench
bench start
# or for production:
# bench setup production
START_CMD
    echo ""
}

add_to_bashrc() {
    echo "=== Add to ~/.bashrc ==="
    echo ""
    cat << 'BASHRC'
# Pyenv
export PYENV_ROOT="$HOME/.pyenv"
export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init -)"

# NVM
export NVM_DIR="/opt/nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Homebrew
eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"

# MariaDB connector
export PKG_CONFIG_PATH="/home/linuxbrew/.linuxbrew/opt/mariadb-connector-c/lib/pkgconfig:$PKG_CONFIG_PATH"
export LDFLAGS="-L/home/linuxbrew/.linuxbrew/opt/mariadb-connector-c/lib"
export CPPFLAGS="-I/home/linuxbrew/.linuxbrew/opt/mariadb-connector-c/include"

# Frappe bench
alias bench-env='cd ~/frappe/frappe-bench && source env/bin/activate'
BASHRC
    echo ""
}

# Main
setup_environment
check_versions
setup_mariadb_docker
build_assets
create_site
install_hazelnode
start_bench
add_to_bashrc

echo "=== Setup Complete ==="
echo ""
echo "Bench location: ~/frappe/frappe-bench"
echo "Frappe app: ~/frappe/frappe-bench/apps/frappe"
echo "Hazelnode app: /home/user/hazelnode"
echo ""
