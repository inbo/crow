<template>
  <div>
    <b-form-row>
      <b-col class="mt-4">
        <b-form inline @submit.prevent="loadData">
          <b-form-input type="date" placeholder="type a date..." v-model="selectedDate" class="mr-2"/>
          <b-button type="submit">Submit</b-button>
        </b-form>
      </b-col>
    </b-form-row>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selectedDate: "2019-03-27"
    };
  },
  methods: {
    loadData(evt) {
      alert("Toto" + evt);
    }
  }
};
</script>
