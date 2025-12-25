#!/usr/bin/env bash
set -eu

##############################################################################
# Blackbox CLI Install Script (Extension Service Version)
#
# This script downloads the latest stable 'blackbox' CLI binary from the
# Extension Upload Service and installs it to your system.
#
# Supported OS: macOS (darwin), Linux, Windows (MSYS2/Git Bash/WSL)
# Supported Architectures: x86_64, arm64
#
# Usage:
#   curl -fsSL https://releases.blackbox.ai/api/scripts/omni-cli/download.sh | bash
#
# Environment variables:
#   BLACKBOX_BIN_DIR     - Directory to which Blackbox will be installed (default: $HOME/.local/bin)
#   BLACKBOX_VERSION     - Optional: specific version to install (e.g., "v1.0.25"). Can be in the format vX.Y.Z, vX.Y.Z-suffix, or X.Y.Z
#   BLACKBOX_PROVIDER    - Optional: provider for blackbox
#   BLACKBOX_MODEL       - Optional: model for blackbox
#   EXTENSION_SERVICE_URL - Extension service URL (default: https://releases.blackbox.ai)
#   CANARY              - Optional: if set to "true", downloads from canary release instead of stable
#   CONFIGURE           - Optional: if set to "false", disables running blackbox configure interactively
#   ** other provider specific environment variables (eg. DATABRICKS_HOST)
##############################################################################

# --- 1) Check for dependencies ---
# Check for curl
if ! command -v curl >/dev/null 2>&1; then
  echo "Error: 'curl' is required to download Blackbox. Please install curl and try again."
  exit 1
fi

# Check for tar or unzip (depending on OS)
if ! command -v tar >/dev/null 2>&1 && ! command -v unzip >/dev/null 2>&1; then
  echo "Error: Either 'tar' or 'unzip' is required to extract Blackbox. Please install one and try again."
  exit 1
fi

# --- 2) Variables ---
PRODUCT_SLUG="omni-cli"
OUT_FILE="blackbox"
BLACKBOX_BIN_DIR="${BLACKBOX_BIN_DIR:-"$HOME/.local/bin"}"
EXTENSION_SERVICE_URL="${EXTENSION_SERVICE_URL:-"https://releases.blackbox.ai"}"
RELEASE="${CANARY:-false}"
CONFIGURE="${CONFIGURE:-true}"

# --- 3) Detect OS/Architecture ---
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

# Handle Windows environments (MSYS2, Git Bash, Cygwin, WSL)
case "$OS" in
  linux|darwin) ;;
  mingw*|msys*|cygwin*)
    OS="windows"
    ;;
  *)
    echo "Error: Unsupported OS '$OS'. Blackbox currently supports Linux, macOS, and Windows."
    exit 1
    ;;
esac

case "$ARCH" in
  x86_64)
    ARCH="x86_64"
    ;;
  arm64|aarch64)
    # Some systems use 'arm64' and some 'aarch64' – standardize to 'aarch64'
    ARCH="aarch64"
    ;;
  *)
    echo "Error: Unsupported architecture '$ARCH'."
    exit 1
    ;;
esac

# Map OS and ARCH to platform string expected by extension service
if [ "$OS" = "darwin" ]; then
  if [ "$ARCH" = "aarch64" ]; then
    PLATFORM="mac-arm64"
  else
    PLATFORM="mac-x64"
  fi
elif [ "$OS" = "windows" ]; then
  # Windows only supports x86_64 currently
  if [ "$ARCH" != "x86_64" ]; then
    echo "Error: Windows currently only supports x86_64 architecture."
    exit 1
  fi
  PLATFORM="win-x64"
  OUT_FILE="blackbox.exe"
else
  # Linux
  if [ "$ARCH" = "aarch64" ]; then
    PLATFORM="linux-arm64"
  else
    PLATFORM="linux-x64"
  fi
fi

# --- 4) Get latest release information from extension service ---
echo -e "\033[90mFetching latest release information for platform: $PLATFORM...\033[0m"

RELEASE_API_URL="$EXTENSION_SERVICE_URL/api/v0/latest?product=$PRODUCT_SLUG&platform=$PLATFORM"

if ! RELEASE_INFO=$(curl -sLf "$RELEASE_API_URL"); then
  echo "Error: Failed to fetch release information from $RELEASE_API_URL"
  echo "Please check that the extension service is available and the product '$PRODUCT_SLUG' exists."
  exit 1
fi

# Parse JSON response to get download URL
# Simple JSON parsing - extract the url field
DOWNLOAD_URL=$(echo "$RELEASE_INFO" | grep -o '"url":"[^"]*"' | cut -d'"' -f4)
VERSION=$(echo "$RELEASE_INFO" | grep -o '"version":"[^"]*"' | cut -d'"' -f4)

if [ -z "$DOWNLOAD_URL" ]; then
  echo "Error: Could not parse download URL from release information"
  echo "Release info: $RELEASE_INFO"
  exit 1
fi

# Ensure download URL is absolute
if [[ "$DOWNLOAD_URL" != http* ]]; then
  DOWNLOAD_URL="$EXTENSION_SERVICE_URL$DOWNLOAD_URL"
fi

echo -e "\033[34mDownloading version $VERSION from: $DOWNLOAD_URL\033[0m"

# --- 5) Download the file ---
# Extract filename from URL
FILENAME=$(basename "$DOWNLOAD_URL")
if [ -z "$FILENAME" ] || [ "$FILENAME" = "/" ]; then
  FILENAME="blackbox-$PLATFORM.tar.bz2"
fi

if ! curl -sLf "$DOWNLOAD_URL" --output "$FILENAME"; then
  echo "Error: Failed to download $DOWNLOAD_URL"
  exit 1
fi

# --- 6) Create temporary directory and extract ---
TMP_DIR="/tmp/blackbox_install_$RANDOM"
if ! mkdir -p "$TMP_DIR"; then
  echo "Error: Could not create temporary extraction directory"
  exit 1
fi
# Clean up temporary directory
trap 'rm -rf "$TMP_DIR"' EXIT

echo -e "\033[90mExtracting $FILENAME to temporary directory...\033[0m"
set +e  # Disable immediate exit on error

# First extraction - the outer zip file (all platforms use zip)
unzip -q "$FILENAME" -d "$TMP_DIR" 2> unzip_error.log
extract_exit_code=$?

if [ $extract_exit_code -ne 0 ]; then
  echo "Error: Failed to extract $FILENAME. See details below:"
  cat unzip_error.log
  rm unzip_error.log
  exit 1
fi
rm unzip_error.log

set -e  # Re-enable immediate exit on error

rm "$FILENAME" # clean up the downloaded archive

# Handle nested archives based on platform
if [ "$OS" = "windows" ]; then
  # Windows: zip -> zip -> blackbox-package/
  NESTED_ZIP=$(find "$TMP_DIR" -name "*.zip" -type f | head -1)
  if [ -n "$NESTED_ZIP" ]; then
    echo "Found nested zip file: $(basename "$NESTED_ZIP")"
    echo "Extracting nested Windows archive..."
    
    set +e  # Disable immediate exit on error
    unzip -q "$NESTED_ZIP" -d "$TMP_DIR" 2> unzip_error.log
    extract_exit_code=$?
    
    if [ $extract_exit_code -ne 0 ]; then
      echo "Error: Failed to extract nested Windows archive. See details below:"
      cat unzip_error.log
      rm unzip_error.log
      exit 1
    fi
    rm unzip_error.log
    set -e  # Re-enable immediate exit on error
    
    # Clean up the nested zip file
    rm "$NESTED_ZIP"
  fi
else
  # Linux/macOS: zip -> tar.bz2 -> binaries
  TAR_BZ2_FILE=$(find "$TMP_DIR" -name "*.tar.bz2" -type f | head -1)
  if [ -n "$TAR_BZ2_FILE" ]; then
    echo "Found nested tar.bz2 file: $(basename "$TAR_BZ2_FILE")"
    echo "Extracting nested archive..."
    
    set +e  # Disable immediate exit on error
    tar -xjf "$TAR_BZ2_FILE" -C "$TMP_DIR" 2> tar_error.log
    extract_exit_code=$?
    
    if [ $extract_exit_code -ne 0 ]; then
      if grep -iEq "missing.*bzip2|bzip2.*missing|bzip2.*No such file|No such file.*bzip2" tar_error.log; then
        echo "Error: Failed to extract nested archive. 'bzip2' is required but not installed. See details below:"
      else
        echo "Error: Failed to extract nested archive. See details below:"
      fi
      cat tar_error.log
      rm tar_error.log
      exit 1
    fi
    rm tar_error.log
    set -e  # Re-enable immediate exit on error
    
    # Clean up the nested tar.bz2 file
    rm "$TAR_BZ2_FILE"
  fi
fi

# Determine the extraction directory (handle subdirectory in packages)
EXTRACT_DIR="$TMP_DIR"
if [ -d "$TMP_DIR/blackbox-package" ]; then
  echo "Found blackbox-package subdirectory, using that as extraction directory"
  EXTRACT_DIR="$TMP_DIR/blackbox-package"
fi

# Make binary executable and verify it exists
if [ "$OS" = "windows" ]; then
  if [ -f "$EXTRACT_DIR/blackbox.exe" ]; then
    chmod +x "$EXTRACT_DIR/blackbox.exe"
  else
    echo "Error: blackbox.exe not found in extracted files"
    echo "Available files in $EXTRACT_DIR:"
    ls -la "$EXTRACT_DIR" || echo "Directory does not exist"
    exit 1
  fi
else
  if [ -f "$EXTRACT_DIR/blackbox" ]; then
    chmod +x "$EXTRACT_DIR/blackbox"
  else
    echo "Error: blackbox binary not found in extracted files"
    echo "Available files in $EXTRACT_DIR:"
    ls -la "$EXTRACT_DIR" || echo "Directory does not exist"
    exit 1
  fi
fi

# --- 7) Install to $BLACKBOX_BIN_DIR ---
if [ ! -d "$BLACKBOX_BIN_DIR" ]; then
  echo "Creating directory: $BLACKBOX_BIN_DIR"
  mkdir -p "$BLACKBOX_BIN_DIR"
fi

echo -e "\033[90mMoving blackbox to $BLACKBOX_BIN_DIR/$OUT_FILE\033[0m"
if [ "$OS" = "windows" ]; then
  mv "$EXTRACT_DIR/blackbox.exe" "$BLACKBOX_BIN_DIR/$OUT_FILE"
else
  mv "$EXTRACT_DIR/blackbox" "$BLACKBOX_BIN_DIR/$OUT_FILE"
fi

# Also move temporal-service and temporal CLI if they exist
if [ "$OS" = "windows" ]; then
  if [ -f "$EXTRACT_DIR/temporal-service.exe" ]; then
    echo -e "\033[90mMoving temporal-service to $BLACKBOX_BIN_DIR/temporal-service.exe\033[0m"
    mv "$EXTRACT_DIR/temporal-service.exe" "$BLACKBOX_BIN_DIR/temporal-service.exe"
    chmod +x "$BLACKBOX_BIN_DIR/temporal-service.exe"
  fi
  
  # Move temporal CLI if it exists
  if [ -f "$EXTRACT_DIR/temporal.exe" ]; then
    echo -e "\033[90mMoving temporal CLI to $BLACKBOX_BIN_DIR/temporal.exe\033[0m"
    mv "$EXTRACT_DIR/temporal.exe" "$BLACKBOX_BIN_DIR/temporal.exe"
    chmod +x "$BLACKBOX_BIN_DIR/temporal.exe"
  fi
  
  # Copy Windows runtime DLLs if they exist
  for dll in "$EXTRACT_DIR"/*.dll; do
    if [ -f "$dll" ]; then
      echo -e "\033[90mMoving Windows runtime DLL: $(basename "$dll")\033[0m"
      mv "$dll" "$BLACKBOX_BIN_DIR/"
    fi
  done
else
  if [ -f "$EXTRACT_DIR/temporal-service" ]; then
    echo -e "\033[90mMoving temporal-service to $BLACKBOX_BIN_DIR/temporal-service\033[0m"
    mv "$EXTRACT_DIR/temporal-service" "$BLACKBOX_BIN_DIR/temporal-service"
    chmod +x "$BLACKBOX_BIN_DIR/temporal-service"
  fi
  
  # Move temporal CLI if it exists
  if [ -f "$EXTRACT_DIR/temporal" ]; then
    echo -e "\033[90mMoving temporal CLI to $BLACKBOX_BIN_DIR/temporal\033[0m"
    mv "$EXTRACT_DIR/temporal" "$BLACKBOX_BIN_DIR/temporal"
    chmod +x "$BLACKBOX_BIN_DIR/temporal"
  fi
fi

# --- 8) Configure Blackbox (Optional) ---
if [ "$CONFIGURE" = true ]; then
  echo ""
  echo "Configuring Blackbox"
  echo ""
  "$BLACKBOX_BIN_DIR/$OUT_FILE" configure
else
  echo "Skipping 'blackbox configure', you may need to run this manually later"
fi

# --- 9) Check PATH and add to shell configuration if needed ---
if [[ ":$PATH:" != *":$BLACKBOX_BIN_DIR:"* ]]; then
  echo ""
  echo -e "\033[90mAdding $BLACKBOX_BIN_DIR to your PATH...\033[0m"
  
  # Determine the appropriate shell configuration file based on OS
  if [ "$OS" = "darwin" ]; then
    # macOS uses zsh by default since Catalina
    SHELL_CONFIG="$HOME/.zshrc"
    SHELL_NAME="zsh"
  else
    # Linux typically uses bash
    SHELL_CONFIG="$HOME/.bashrc"
    SHELL_NAME="bash"
  fi
  
  # Create the shell config file if it doesn't exist
  if [ ! -f "$SHELL_CONFIG" ]; then
    echo -e "\033[90mCreating $SHELL_CONFIG...\033[0m"
    touch "$SHELL_CONFIG"
  fi
  
  # Check if the PATH export already exists in the file
  if ! grep -q "export PATH.*$BLACKBOX_BIN_DIR" "$SHELL_CONFIG"; then
    echo -e "\033[90mAdding Blackbox to PATH in $SHELL_CONFIG...\033[0m"
    echo "" >> "$SHELL_CONFIG"
    echo "# Added by Blackbox CLI installer" >> "$SHELL_CONFIG"
    echo "export PATH=\"$BLACKBOX_BIN_DIR:\$PATH\"" >> "$SHELL_CONFIG"
    echo -e "\033[90mPATH successfully added to $SHELL_CONFIG for future terminal sessions.\033[0m"
    
    # Note: When running via curl | bash, we cannot update the parent shell's PATH
    echo ""
    echo -e "\033[93mTo use Blackbox immediately in this terminal session, run:\033[0m"
    echo -e "\033[93m    export PATH=\"$BLACKBOX_BIN_DIR:\$PATH\"\033[0m"
    echo ""
    echo -e "\033[93mOr restart your terminal to automatically load the updated PATH.\033[0m"
  else
    echo -e "\033[90mPATH entry already exists in $SHELL_CONFIG\033[0m"
    echo ""
    echo -e "\033[93mTo use Blackbox immediately in this terminal session, run:\033[0m"
    echo -e "\033[93m    export PATH=\"$BLACKBOX_BIN_DIR:\$PATH\"\033[0m"
    echo ""
    echo -e "\033[93mOr restart your terminal to automatically load the updated PATH.\033[0m"
  fi
  echo ""
fi

echo -e "\033[32mBlackbox CLI v$VERSION installed successfully at $BLACKBOX_BIN_DIR/$OUT_FILE\033[0m"
