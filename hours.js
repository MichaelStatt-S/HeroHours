let configFile = 'config.json';
let endpoint;
let successSound;
let errorSound;
const date = new Date();

function transformTabularData(rawdata) {
  // This is an example of array destructuring.
  // - extract the first item in the array into local variable `headers`
  // - assign the remainder of the array to local variable `data` using the rest operator
  const [columns, ...rows] = rawdata;

  // do a 1 for 1 conversion of each row into an object and return a new array
  return rows.map((values) =>
    // create a new object per row
    // use the column headers as the object key
    // and the corresponding row value as the object value
    columns.reduce((obj, column, index) => {
      obj[column] = values[index];
      return obj;
    }, {})
  );
}

async function userAction(userID, operation) {
  const url = `${endpoint}?${new URLSearchParams({
    userID,
    operation,
  })}`;
  const data = await fetch(url, {
    method: 'GET',
    redirect: 'follow',
  }).then((response) => response.json());

  if (data.status === 'error') {
    errorSound.play();
  } else if (data.status === 'success') {
    successSound.play();
  }

  return {
    userID,
    operation,
    status: data.status,
    message: data.message,
  };
}

const app = {
  name: 'Hours',
  data() {
    return {
      form: {
        userID: '',
        operation: '',
      },
      mode: {
        operation: 'checkIn',
        text: 'Check In',
      },
      localLog: [],
      usersData: [],
      usersCheckedIn: 0,
      onLine: navigator.onLine,
      dateTime: new Date(),
      timer: undefined,
    };
  },
  beforeMount() {
    this.timer = setInterval(this.setDateTime, 1000);
  },
  mounted() {
    fetch(configFile)
      .then((res) => res.json())
      .then((config) => {
        endpoint = config['endpoint'];
        successSound = new Audio(config['successSound']);
        errorSound = new Audio(config['errorSound']);
      })
      .then(this.getUsersData)
      .catch((err) => console.error(err));

    window.addEventListener('online', this.updateOnlineStatus);
    window.addEventListener('offline', this.updateOnlineStatus);
    window.addEventListener('keydown', (e) => {
      if (e.key == '*') {
        location.reload();
      }
    });
    this.enableUserField();
  },
  beforeDestroy() {
    window.removeEventListener('online', this.updateOnlineStatus);
    window.removeEventListener('offline', this.updateOnlineStatus);
    window.removeEventListener('keydown');
  },
  beforeUnmount() {
    clearInterval(this.timer);
  },
  computed: {
    localLogEntries() {
      return this.localLog.slice(-10);
    },
  },
  methods: {
    enableUserField() {
      this.$refs.userID.disabled = false;
      this.$refs.userID.focus();
    },
    disableUserField() {
      this.$refs.userID.disabled = true;
    },
    setDateTime() {
      this.dateTime = new Date();
    },
    //https://javascript.plainenglish.io/create-a-digital-clock-app-with-vue-3-and-javascript-c5c0251d5ce3
    updateOnlineStatus(e) {
      const { type } = e;
      if (e.type === 'offline') {
        this.disableUserField();
      } else {
        this.enableUserField();
      }
      this.onLine = type === 'online';
    },
    async submitForm() {
      this.disableUserField();

      if (this.form.userID === '+00') {
        // if user types +00 set mode to checkIn
        this.mode.operation = 'checkIn';
        this.mode.text = 'Check In';
        this.form.userID = '';
        this.getUsersData();
        this.enableUserField();
      } else if (this.form.userID === '+01') {
        // if user types +01 set mode to checkOut
        this.mode.operation = 'checkOut';
        this.mode.text = 'Check Out';
        this.form.userID = '';
        this.getUsersData();
        this.enableUserField();
      } else if (this.form.userID === '+404') {
        // if user types +404 find all checked in users and check them all out
        this.mode.operation = 'checkOut';
        const loggedInUserIds = this.usersData
          .filter((user) => user['Checked In'] == true)
          .map((user) => user['User ID']);

        await Promise.allSettled(
          loggedInUserIds.map((id) => userAction(id, 'checkOut').then((result) => this.localLog.push(result)))
        );

        this.enableUserField();
        this.form.userID = '';
        this.getUsersData();
      } else if (this.form.userID === '') {
        //if user submits nothing do nothing
        this.enableUserField();
      } else {
        const result = await userAction(this.form.userID, this.mode.operation);

        this.localLog.push(result);
        this.enableUserField();
        this.form.userID = '';
        this.getUsersData();
      }
    },
    async getUsersData() {
      await fetch(
        endpoint +
          '?' +
          new URLSearchParams({
            operation: 'getUsersData',
          }),
        {
          method: 'GET',
          redirect: 'follow',
        }
      )
        .then((response) => response.json())
        .then((data) => {
          usersCheckedInCount = 0;
          this.usersData = transformTabularData(data);
          data.forEach((item, index) => {
            if (index > 0) {
              item[4] === true && usersCheckedInCount++;
            }
          });
          this.usersCheckedIn = usersCheckedInCount;
        });
    },
    convertTimestampToDuration(timestamp) {
      d = Number(timestamp);

      var h = Math.floor(d / 3600);
      var m = Math.floor((d % 3600) / 60);
      var s = Math.floor((d % 3600) % 60);

      return ('0' + h).slice(-2) + ':' + ('0' + m).slice(-2);
      // https://stackoverflow.com/questions/5539028/converting-seconds-into-hhmmss
    },
  },
  watch: {
    onLine(v) {
      if (v) {
        this.showBackOnline = true;
        setTimeout(() => {
          this.showBackOnline = false;
        }, 1000);
      }
    },
  },
};
Vue.createApp(app).mount('#app');
