import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import { Validation } from "vuelidate"; //Don't remove this import
import { email, required } from "vuelidate/lib/validators";
import { User, UserUpdateInfo } from "core/api/api-clients";

@Component({
  validations: {
    userInfo: {
      email: { email },
      firstName: { required },
      lastName: { required }
    }
  }
})
export default class EditUserModal extends Vue {
  @Prop()
  user!: User;

  @Prop()
  isLoading!: boolean;

  @Watch("user")
  onPropertyChanged(newUser: User) {
    const newUserCopy = new User();
    newUserCopy.init({ ...newUser });
    this.userInfo = newUserCopy;
  }

  userInfo: User | null = null;

  public resetForm(): void {
    this.$nextTick(() => {
      this.$v.$reset();
    });
  }

  public submitForm(): void {
    if (this.userInfo) {
      const user: UserUpdateInfo = new UserUpdateInfo();
      user.init({
        firstName: this.userInfo.firstName,
        lastName: this.userInfo.lastName,
        fullName: `${this.userInfo.firstName} ${this.userInfo.lastName}`,
        email: this.userInfo.email,
        roles: [this.userInfo.role!.name!],
        id: this.userInfo.id
      });
      this.$bvModal.hide("editUserModal");
      this.$emit("userChanged", user);
    }
  }
}
