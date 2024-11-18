# Run Tuumik on local machine

These instructions show how to run Tuumik on a local machine in a development environment. This is only for development purposes and testing. You should not run Tuumik like this for production use.

- The instructions show setting up Tuumik on Linux
- For Macs, the process is very similar, except installing Node Version Manager via Homebrew
- For Windows it is strongly recommended to use WSL 2 to run Tuumik

**1. Install Node Version Manager (NVM)**

```shell
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
```

**2. Install Node v20 via NVM**

```shell
nvm install 20
nvm use 20
```

**3. Install Meteor**

```shell
npx meteor
```

**4. Download Tuumik**

You can download the latest release of Tuumik from https://github.com/tuumikapp/tuumik/releases

**5. Extract Tuumik**

```shell
unzip tuumik-1.0.4.zip
```

**6. In project directory copy the deploy-examples directory to .deploy**

```shell
cd tuumik-1.0.4
cp -r deploy-examples .deploy
```

Notice the dot in ".deploy". This means a hidden directory.

**7. Install npm dependencies**

```shell
meteor npm install
```

**8. Start app**

```shell
meteor npm run local:demo
```

**9. Open http://localhost:3000/ in browser**

You should see Tuumik's login page. Since you started Tuumik with demo settings, you should be able to start a demo similar to https://demo.tuumik.com.
