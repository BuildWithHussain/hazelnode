#!/bin/bash
# Frappe Bench v16 Setup Script
# Uses pyenv for Python 3.14 and nvm for Node 24
# References:
# - https://github.com/pyenv/pyenv
# - https://github.com/nvm-sh/nvm
# - https://docs.frappe.io/framework/user/en/installation

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
	echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
	echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
	echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
	log_error "Please do not run this script as root"
	exit 1
fi

# ============================================================
# Step 1: Install System Dependencies
# ============================================================
log_info "Installing system dependencies..."

sudo apt-get update
sudo apt-get install -y \
	build-essential \
	git \
	curl \
	wget \
	libssl-dev \
	zlib1g-dev \
	libbz2-dev \
	libreadline-dev \
	libsqlite3-dev \
	libncursesw5-dev \
	xz-utils \
	tk-dev \
	libxml2-dev \
	libxmlsec1-dev \
	libffi-dev \
	liblzma-dev \
	libxslt1-dev \
	libsasl2-dev \
	libldap2-dev \
	libjpeg-dev \
	libcups2-dev \
	libpq-dev \
	libtiff5-dev \
	libmysqlclient-dev \
	wkhtmltopdf \
	software-properties-common

# ============================================================
# Step 2: Install and Configure MariaDB
# ============================================================
log_info "Installing MariaDB..."

sudo apt-get install -y mariadb-server mariadb-client

# Start and enable MariaDB
sudo systemctl start mariadb
sudo systemctl enable mariadb

# Configure MariaDB for Frappe
log_info "Configuring MariaDB for Frappe..."

MARIADB_CONFIG="/etc/mysql/mariadb.conf.d/99-frappe.cnf"
sudo tee "$MARIADB_CONFIG" > /dev/null <<EOF
[mysqld]
character-set-client-handshake = FALSE
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

[mysql]
default-character-set = utf8mb4
EOF

sudo systemctl restart mariadb

log_info "MariaDB installed and configured"

# ============================================================
# Step 3: Install and Configure Redis
# ============================================================
log_info "Installing Redis..."

sudo apt-get install -y redis-server

sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verify Redis is running
if redis-cli ping | grep -q "PONG"; then
	log_info "Redis is running correctly"
else
	log_error "Redis failed to start"
	exit 1
fi

# ============================================================
# Step 4: Install pyenv and Python 3.14
# ============================================================
log_info "Installing pyenv..."

# Remove existing pyenv if present
if [ -d "$HOME/.pyenv" ]; then
	log_warn "Existing pyenv installation found, removing..."
	rm -rf "$HOME/.pyenv"
fi

# Install pyenv using the official installer
curl -fsSL https://pyenv.run | bash

# Configure shell for pyenv
PYENV_CONFIG='
# pyenv configuration
export PYENV_ROOT="$HOME/.pyenv"
[[ -d $PYENV_ROOT/bin ]] && export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init -)"
'

# Add to bashrc if not already present
if ! grep -q "PYENV_ROOT" "$HOME/.bashrc"; then
	echo "$PYENV_CONFIG" >> "$HOME/.bashrc"
fi

# Source pyenv for current session
export PYENV_ROOT="$HOME/.pyenv"
export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init -)"

log_info "Installing Python 3.14..."
pyenv install 3.14 -s
pyenv global 3.14

# Verify Python installation
PYTHON_VERSION=$(python --version 2>&1)
log_info "Python installed: $PYTHON_VERSION"

# ============================================================
# Step 5: Install nvm and Node 24
# ============================================================
log_info "Installing nvm..."

# Remove existing nvm if present
if [ -d "$HOME/.nvm" ]; then
	log_warn "Existing nvm installation found, removing..."
	rm -rf "$HOME/.nvm"
fi

# Install nvm v0.40.3
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

# Configure shell for nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

log_info "Installing Node.js 24..."
nvm install 24
nvm use 24
nvm alias default 24

# Verify Node installation
NODE_VERSION=$(node --version 2>&1)
log_info "Node.js installed: $NODE_VERSION"

# Install yarn globally
npm install -g yarn

YARN_VERSION=$(yarn --version 2>&1)
log_info "Yarn installed: $YARN_VERSION"

# ============================================================
# Step 6: Install Frappe Bench CLI
# ============================================================
log_info "Installing Frappe Bench CLI..."

pip install --upgrade pip
pip install frappe-bench

# Verify bench installation
BENCH_VERSION=$(bench --version 2>&1)
log_info "Bench installed: $BENCH_VERSION"

# ============================================================
# Step 7: Initialize Frappe Bench with v16/develop
# ============================================================
log_info "Initializing Frappe Bench with v16/develop branch..."

BENCH_DIR="$HOME/frappe-bench"

if [ -d "$BENCH_DIR" ]; then
	log_warn "Bench directory already exists at $BENCH_DIR"
	read -p "Do you want to remove it and create fresh? (y/n): " -n 1 -r
	echo
	if [[ $REPLY =~ ^[Yy]$ ]]; then
		rm -rf "$BENCH_DIR"
	else
		log_info "Skipping bench initialization"
		exit 0
	fi
fi

bench init "$BENCH_DIR" \
	--frappe-branch develop \
	--python "$(pyenv which python)" \
	--verbose

cd "$BENCH_DIR"

# ============================================================
# Step 8: Create a new site (optional)
# ============================================================
log_info "Bench initialized successfully at $BENCH_DIR"

echo ""
echo "============================================================"
echo -e "${GREEN}Frappe Bench v16 Setup Complete!${NC}"
echo "============================================================"
echo ""
echo "Installed versions:"
echo "  - Python: $PYTHON_VERSION"
echo "  - Node.js: $NODE_VERSION"
echo "  - Yarn: $YARN_VERSION"
echo "  - Bench: $BENCH_VERSION"
echo ""
echo "Bench location: $BENCH_DIR"
echo ""
echo "Next steps:"
echo "  1. cd $BENCH_DIR"
echo "  2. bench new-site <site-name> --db-root-password <password>"
echo "  3. bench get-app <app-name>"
echo "  4. bench --site <site-name> install-app <app-name>"
echo "  5. bench start"
echo ""
echo "To add hazelnode app:"
echo "  bench get-app $(pwd)"
echo "  bench --site <site-name> install-app hazelnode"
echo ""
log_info "Please restart your terminal or run: source ~/.bashrc"
