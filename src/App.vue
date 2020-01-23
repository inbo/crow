<template>
  <div id="app">
    <b-navbar type="light" variant="light" toggleable="lg">
      <b-container>
        <b-navbar-brand>CROW</b-navbar-brand>
      </b-container>
    </b-navbar>

    <main>
      <b-container>
        <Crow/>
      </b-container>
    </main>
    
    <footer>
      <b-container>
        <b-row>
          <b-col lg>
            Created by the <a href="https://oscibio.inbo.be">Open science lab for biodiversity</a>
          </b-col>
          <b-col lg class="text-right">
            <a href="https://github.com/inbo/crow/">Source code</a>
          </b-col>
        </b-row>
      </b-container>
    </footer>
  </div>
</template>

<script>
import Crow from "./components/Crow.vue";

export default {
  name: "app",
  components: {
    Crow
  }
};
</script>

<style>
.navbar {
  background-color: white!important;
  border-bottom: 1px solid #e9ecef;
  }
  .navbar-brand {
    font-weight: bold;
    }
    .navbar-brand img {
      height: 30px;
    }

main {
  min-height: calc(100vh - 54px); /* Viewport height minus medium screen navbar height, to push footer to bottom */
  padding-bottom: $grid-gutter-width; /* Don't stick to footer */
}

footer {
  background-color: #3c3c3c;
  border-top: 5px solid #bcbcbc;
  color: #bcbcbc;
  font-size: 0.9rem;
  padding: 15px 0;
  }
  footer a,
  footer a:hover,
  footer a:visited {
    color: white;
  }
</style>
