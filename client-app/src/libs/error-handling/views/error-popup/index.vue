<template>
  <div>
    <error-detail v-for="(error, index) in errors"
                  :id="'error-'+index"
                  :key="error.message"
                  :index="index"
                  :error-info="error"
                  @close="removeError(error)">
    </error-detail>
  </div>
</template>

<script lang="ts" src="./error-popup.ts"></script>
